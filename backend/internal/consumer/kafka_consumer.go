package consumer

import (
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/IBM/sarama"
	"github.com/ducanhpham0312/zeevision/backend/internal/storage"
)

type msgChannelType = chan []byte
type signalChannelType = chan struct{}

type listenOnlyMsgChannel = <-chan []byte
type listenOnlySignalChannel = <-chan struct{}

// We know what topics we can handle inside this package; this does not really
// need to be exposed on the outside
var knownTopics = []string{
	"zeebe-deployment",
	"zeebe-deployment-distribution",
	"zeebe-error",
	"zeebe-incident",
	"zeebe-job",
	"zeebe-job-batch",
	"zeebe-message",
	"zeebe-message-subscription",
	"zeebe-message-subscription-start-event",
	"zeebe-process",
	"zeebe-process-event",
	"zeebe-process-instance",
	"zeebe-process-instance-result",
	"zeebe-process-message-subscription",
	"zeebe-timer",
	"zeebe-variable",
}

// TODO: we need a method of reconnecting when the connection drops. I'm not
// entirely sure how to *detect* this, except perhaps by adding a condition
// variable of some kind to the Consumer object where, upon seeing it, a
// housekeeping goroutine would proceed to close down and restart all the
// topics (since we keep track of every topic this would not be excessively
// difficult). The housekeeping goroutine could also be in charge of retrying
// and should close down when the externally visible Close method is called (so
// we should have an internal close method it calls to clean up after
// signalling the housekeeping goroutine to close first)
// TODO: we likely need synchronisation on at least some of the methods of this
// struct... or a restriction on calling any of them from outside the main
// goroutine?
type Consumer struct {
	brokers []string
	topics  []string

	storageUpdater *storageUpdater

	consumer     sarama.Consumer
	msgChannels  map[string]msgChannelType
	closeChannel chan struct{}

	wg *sync.WaitGroup
}

func NewConsumer(storer storage.Storer, brokers []string, maxRetries int, retryDelay time.Duration) (*Consumer, error) {
	// wrap newConsumer with retry handling
	var err error
	for attempt := 1; attempt <= maxRetries; attempt++ {
		kafkaConsumer, err := newConsumer(storer, brokers)
		if err == nil {
			return kafkaConsumer, nil
		}
		time.Sleep(retryDelay)
	}
	return nil, fmt.Errorf("maximum number of retries reached: %w", err)
}

func newConsumer(storer storage.Storer, brokers []string) (*Consumer, error) {
	config := sarama.NewConfig()

	consumer, err := sarama.NewConsumer(brokers, config)
	for err != nil {
		return nil, err
	}

	msgChannels := map[string]msgChannelType{}
	for _, topic := range knownTopics {
		// The optimal buffer size is an open question; it could be as low as 0
		// if we're okay yielding the consumer goroutine whenever we get to
		// that point
		bufSize := 10
		msgChannel := make(msgChannelType, bufSize)
		msgChannels[topic] = msgChannel
	}

	closeChannel := make(signalChannelType)

	var wg sync.WaitGroup

	storageUpdater := newDatabaseUpdater(storer, msgChannels, closeChannel, &wg)

	result := Consumer{
		brokers: brokers,
		topics:  []string{},

		storageUpdater: storageUpdater,

		consumer:     consumer,
		msgChannels:  msgChannels,
		closeChannel: closeChannel,

		wg: &wg,
	}

	for _, topic := range knownTopics {
		err = result.ConsumeTopic(0, topic)
		if err != nil {
			// If consuming a topic fails, close consumer and
			// return error
			result.Close()
			return nil, err
		}
	}

	return &result, err
}

// ConsumeTopic creates a sarama.PartitionConsumer to consume a particular topic.
func (consumer *Consumer) ConsumeTopic(partition int32, topic string) (err error) {
	partitionConsumer, err := consumer.consumer.ConsumePartition(
		topic, partition, sarama.OffsetNewest)

	if err != nil {
		return err
	}
	msgChannel := consumer.msgChannels[topic]
	closeChannel := consumer.closeChannel
	wg := consumer.wg

	// We're launching a new goroutine, increment the waitgroup counter
	// TODO this and the goroutine creation might need to be locked? Unsure
	// about the synchronisation here as a whole
	wg.Add(1)
	go func() {
		// When this goroutine ends, signal the waitgroup that we're done
		defer wg.Done()
		defer func() {
			if err := partitionConsumer.Close(); err != nil {
				log.Fatal("partition consumer close error:", err)
			}
		}()

	readLoop:
		for {
			select {
			case <-closeChannel:
				// Synchronise reader closes on a channel
				break readLoop
			case msg := <-partitionConsumer.Messages():
				// If we got a message do not block on writing
				// it to our own message channel
				// TODO: don't necessarily log every message like this
				select {
				case msgChannel <- msg.Value:
					log.Printf("[%s/%d] Consumed message offset %d\n",
						topic, partition, msg.Offset)
				case <-closeChannel:
					// Also listen to closeChannel here to
					// avoid dropping values on the floor
					// (we'll end up waiting for the reader
					// to read messages before reading more
					// from kafka ourselves)
					break readLoop

				}
				// No default case so we will simply wait when there's
				// nothing to do
			}
		}
	}()

	return err
}

func (consumer *Consumer) Close() error {
	// Close the partitionconsumers (they will simply log any errors when
	// closing; it's hard to retry that)
	// Sending a message to closeChannel would just close *one* goroutine -
	// closing it will make all goroutines read a nil from it instead.
	close(consumer.closeChannel)
	consumer.wg.Wait()

	err := consumer.consumer.Close()
	return err
}

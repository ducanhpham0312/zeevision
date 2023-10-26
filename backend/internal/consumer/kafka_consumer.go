package consumer

import (
	"log"
	"sync"

	"github.com/IBM/sarama"
)

type ChannelType = chan []byte

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

	consumer   sarama.Consumer
	msgChannel ChannelType

	wg           *sync.WaitGroup
	closeChannel chan struct{}
}

func NewConsumer(brokers []string) (*Consumer, error) {
	config := sarama.NewConfig()

	consumer, err := sarama.NewConsumer(brokers, config)
	for err != nil {
		return nil, err
	}

	// TODO: buffer channel sufficiently so we don't *usually* end up
	// dropping anything or blocking too much?
	// Depending on what the storage API looks like the channel might not
	// be needed in the end (could be wrapped by a storage call)
	bufSize := 10

	var wg sync.WaitGroup
	result := Consumer{
		brokers: brokers,
		topics:  []string{},

		consumer:   consumer,
		msgChannel: make(ChannelType, bufSize),

		wg:           &wg,
		closeChannel: make(chan struct{}),
	}

	return &result, err
}

// ConsumeTopic creates a sarama.PartitionConsumer to consume a particular topic.
// TODO: In the future this will not return a channel but will instead connect
// to our storage in some manner
func (consumer *Consumer) ConsumeTopic(partition int32, topic string) (msgChannel ChannelType, err error) {
	partitionConsumer, err := consumer.consumer.ConsumePartition(
		topic, partition, sarama.OffsetNewest)

	if err != nil {
		return nil, err
	}
	msgChannel = consumer.msgChannel
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
					log.Printf("Consumed message offset %d\n", msg.Offset)
					log.Printf("value: %s\n", string(msg.Value))
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

	return msgChannel, err
}

func (consumer *Consumer) Close() error {
	// Close the partitionconsumers (they will simply log any errors when
	// closing; it's hard to retry that)
	consumer.closeChannel <- struct{}{}
	consumer.wg.Wait()

	err := consumer.consumer.Close()
	return err
}

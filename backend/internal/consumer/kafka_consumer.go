package consumer

import (
	"log"
	"sync"

	"github.com/IBM/sarama"
)

type channelType chan []byte

// TODO: we likely need synchronisation on at least some of the methods of this
// struct... or a restriction on calling any of them from outside the main
// goroutine?
type Consumer struct {
	brokers []string
	topics  []string

	consumer      sarama.Consumer
	topicChannels map[string]channelType

	wg           *sync.WaitGroup
	closeChannel chan bool
}

func NewConsumer(brokers []string) (*Consumer, error) {
	config := sarama.NewConfig()

	consumer, err := sarama.NewConsumer(brokers, config)
	for err != nil {
		return nil, err
	}

	var wg sync.WaitGroup
	result := Consumer{
		brokers: brokers,
		topics:  []string{},

		consumer:      consumer,
		topicChannels: map[string]channelType{},

		wg:           &wg,
		closeChannel: make(chan bool),
	}

	return &result, err
}

// ConsumeTopic creates a sarama.PartitionConsumer to consume a particular topic.
// TODO: we may not want to return the channel if we get it from the consumer object instead
func (consumer Consumer) ConsumeTopic(partition int32, topic string) (msgChannel channelType, err error) {
	// TODO: does this actually write to our err or does it shadow it
	partitionConsumer, err := consumer.consumer.ConsumePartition(
		topic, partition, sarama.OffsetNewest)

	if err != nil {
		return
	}

	// TODO: buffer channel sufficiently so we don't *usually* end up
	// dropping anything or blocking too much?
	bufSize := 10
	msgChannel = make(channelType, bufSize)
	consumer.topicChannels[topic] = msgChannel

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
			case _ = <-closeChannel:
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
				default:
					// TODO: figure out a method to avoid
					// this while not blocking indefinitely
					// We do need to include the default case, though!
					// Otherwise on closing we may block indefinitely
					// (Possibly msgChannel <- msg.Value
					// should be part of the main select?
					// just need to figure out how to pass
					// the messages there. an internal channel?)
					log.Printf("Dropping value on the floor (no reader)")
					log.Printf("value: %s\n", string(msg.Value))
				}
			// No default case so we will simply wait when there's
			// nothing to do
			}
		}
	}()

	return
}

// TODO: func (consumer Consumer) GetChannel(topic string) channelType

func (consumer Consumer) Close() error {
	// Close the partitionconsumers (they will simply log any errors when
	// closing; it's hard to retry that)
	consumer.closeChannel <- true
	consumer.wg.Wait()

	if err := consumer.consumer.Close(); err != nil {
		return err
	}

	return nil
}

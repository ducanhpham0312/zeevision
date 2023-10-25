package consumer

import (
	"log"
	"sync"

	"github.com/IBM/sarama"
)

type channelType chan []byte

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
	msgChannel channelType

	wg           *sync.WaitGroup
	closeChannel chan bool
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
		msgChannel: make(channelType, bufSize),

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
				default:
					// TODO: figure out a method to avoid
					// this while not blocking indefinitely
					// We do need to include the default case, though!
					// Otherwise on closing we may block indefinitely
					// (Possibly msgChannel <- msg.Value
					// should be part of the main select?
					// just need to figure out how to pass
					// the messages there. an internal channel?)
					log.Printf("Dropping value on the floor (would block)")
					log.Printf("value: %s\n", string(msg.Value))
				}
				// No default case so we will simply wait when there's
				// nothing to do
			}
		}
	}()

	return
}

// TODO: func (consumer Consumer) GetChannel() channelType
// except that we're actually going to be passing data to our storage/database
// layer which will pass it on - even streaming wouldn't go directly from here,
// probably
// If another layer wants to have an internal channel they can implement that
// there. The channel is just kind of a hack!

func (consumer Consumer) Close() error {
	// Close the partitionconsumers (they will simply log any errors when
	// closing; it's hard to retry that)
	consumer.closeChannel <- true
	consumer.wg.Wait()

	err := consumer.consumer.Close()
	return err
}

package consumer

import (
	"log"
	"time"

	"github.com/IBM/sarama"
)

type ConsumerConfig struct {
	brokers       []string
	topicChannels map[string]chan []byte
	partition     int32

	topicConsumers map[string]sarama.PartitionConsumer
}

// GetChannel returns the message channel in config corresponding to topic.
//
// Returns the channel, or nil if no corresponding channel was found.
func (config ConsumerConfig) GetChannel(topic string) chan []byte {
	if channel, ok := config.topicChannels[topic]; ok {
		return channel
	}
	return nil
}

func NewConsumerConfig(brokers, topics []string, partition int32) ConsumerConfig {
	topicChannels := map[string]chan []byte{}
	for _, topic := range topics {
		topicChannels[topic] = make(chan []byte)
	}
	return ConsumerConfig{
		brokers,
		topicChannels,
		partition,

		map[string]sarama.PartitionConsumer{},
	}
}

func ConsumeStream(consumerConfig ConsumerConfig) {
	config := sarama.NewConfig()

	// TODO(#120): Add robust retry logic and error recovery.
	consumer, err := sarama.NewConsumer(consumerConfig.brokers, config)
	for err != nil {
		log.Printf("Error while creating consumer: %v", err)
		consumer, err = sarama.NewConsumer(consumerConfig.brokers, config)

		// Wait before retrying.
		const WaitSeconds = 5
		<-time.After(WaitSeconds * time.Second)
	}

	defer func() {
		if err := consumer.Close(); err != nil {
			log.Fatal("consumer close error:", err)
		}
	}()

	for topic, _ := range consumerConfig.topicChannels {
		partitionConsumer, err := consumer.ConsumePartition(
			topic, consumerConfig.partition, sarama.OffsetNewest)

		if err != nil {
			log.Fatal("consume partition error:", err)
		}

		defer func() {
			if err := partitionConsumer.Close(); err != nil {
				log.Fatal("partition consumer close error:", err)
			}
		}()

		consumerConfig.topicConsumers[topic] = partitionConsumer
	}

	for {
		// TODO: these should be separate goroutines
		for topic, partitionConsumer := range consumerConfig.topicConsumers {
			msg := <-partitionConsumer.Messages()
			log.Printf("Consumed message offset %d\n", msg.Offset)
			log.Printf("value: %s\n", string(msg.Value))
			consumerConfig.GetChannel(topic) <- msg.Value
		}
	}
}

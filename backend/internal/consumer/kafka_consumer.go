package consumer

import (
	"log"
	"time"

	"github.com/IBM/sarama"
)

func ConsumeStream(addrs []string, topic string, partition int32, msgChannel chan []byte) {
	config := sarama.NewConfig()

	// TODO(#120): Add robust retry logic and error recovery.
	consumer, err := sarama.NewConsumer(addrs, config)
	for err != nil {
		log.Printf("Error while creating consumer: %v", err)
		consumer, err = sarama.NewConsumer(addrs, config)

		// Wait before retrying.
		const WaitSeconds = 5
		<-time.After(WaitSeconds * time.Second)
	}

	defer func() {
		if err := consumer.Close(); err != nil {
			log.Fatal("consumer close error:", err)
		}
	}()

	partitionConsumer, err := consumer.ConsumePartition(
		topic, partition, sarama.OffsetNewest)
	if err != nil {
		log.Fatal("consume partition error:", err)
	}

	defer func() {
		if err := partitionConsumer.Close(); err != nil {
			log.Fatal("partition consumer close error:", err)
		}
	}()

	consumed := 0
	for {
		msg := <-partitionConsumer.Messages()
		log.Printf("Consumed message offset %d\n", msg.Offset)
		log.Printf("value: %s\n", string(msg.Value))
		consumed++
		msgChannel <- msg.Value
	}
}

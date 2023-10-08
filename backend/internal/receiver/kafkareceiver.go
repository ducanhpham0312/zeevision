package receiver

import (
	"log"

	"github.com/IBM/sarama"
)

func ConsumeStream(addrs []string, topic string, partition int32, msgChannel chan []byte) {
	config := sarama.NewConfig()

	// Needs to run on localhost for now vs the docker container.
	consumer, err := sarama.NewConsumer(addrs, config)
	if err != nil {
		panic(err)
	}

	defer func() {
		if err := consumer.Close(); err != nil {
			log.Fatalln(err)
		}
	}()

	partitionConsumer, err := consumer.ConsumePartition(
		topic, partition, sarama.OffsetNewest)
	if err != nil {
		panic(err)
	}

	defer func() {
		if err := partitionConsumer.Close(); err != nil {
			log.Fatalln(err)
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

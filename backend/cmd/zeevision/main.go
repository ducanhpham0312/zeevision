package main

import (
	"log"
	"os"

	"github.com/ducanhpham0312/zeevision/backend/internal/consumer"
	"github.com/ducanhpham0312/zeevision/backend/internal/endpoint"
)

const (
	// Default Kafka address to use.
	DefaultKafkaAddr = "kafka:9093"

	// Environment variable used to configure the Kafka address.
	EnvVarKafkaAddr = "ZEEVISION_KAFKA_ADDR"
)

// Entry point for the application.
func main() {
	// Get Kafka address from environment variable.
	kafkaAddr := DefaultKafkaAddr
	if envKafkaAddr, ok := os.LookupEnv(EnvVarKafkaAddr); ok {
		kafkaAddr = envKafkaAddr
	}

	// Launch goroutine for consuming from specified topic and partition
	brokers := []string{kafkaAddr}
	kafkaConsumer, err := consumer.NewConsumer(brokers)
	if err != nil {
		// TODO: error handling
		panic(err)
	}
	// The consumer needs to be closed manually because its sub-consumers
	// need to be closed manually
	defer kafkaConsumer.Close()

	topic := "zeebe-deployment"
	msgChannel, err := kafkaConsumer.ConsumeTopic(0, topic)
	if err != nil {
		// TODO: error handling
		panic(err)
	}

	// TODO: replace the msgChannel with a pointer to the consumer, perhaps,
	// so we can simply request the channels we want
	server, err := endpoint.NewFromEnv(msgChannel)
	if err != nil {
		log.Fatal(err)
	}

	if err := server.Run(); err != nil {
		log.Fatal(err)
	}
}

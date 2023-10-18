package main

import (
	"fmt"
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

	msgChannel := make(chan []byte)
	// Launch goroutine for consuming from specified topic and partition
	brokers := []string{kafkaAddr}
	go consumer.ConsumeStream(brokers, "zeebe-message", 0, msgChannel)

	go func() {
		for {
			msg := <-msgChannel
			fmt.Printf("Message received: %s\n", msg)
		}
	}()

	server, err := endpoint.NewFromEnv()
	if err != nil {
		log.Fatal(err)
	}

	if err := server.Run(); err != nil {
		log.Fatal(err)
	}
}

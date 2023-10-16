package main

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/ducanhpham0312/zeevision/backend/internal/consumer"
	"github.com/ducanhpham0312/zeevision/backend/internal/endpoint"
)

const DefaultWebsocketPort = 8080
const DefaultKafkaAddr = "localhost:9092"

// Entry point for the application.
func main() {
	// Lookup address for Kafka broker.
	kafkaAddr, ok := os.LookupEnv("KAFKA_ADDR")
	if !ok {
		log.Println("KAFKA_ADDR not set; using default address")
		kafkaAddr = DefaultKafkaAddr
	}
	log.Printf("Listening for Kafka at %s\n", kafkaAddr)

	msgChannel := make(chan []byte)

	// Launch goroutine for consuming from specified topic and partition
	brokers := []string{kafkaAddr}
	go consumer.ConsumeStream(brokers, "zeebe-deployment", 0, msgChannel)

	go func() {
		for {
			msg := <-msgChannel
			fmt.Printf("Message received: %s\n", msg)
		}
	}()

	// Create default configuration.
	conf := &endpoint.Config{
		Port: DefaultWebsocketPort,
	}

	// Override configuration with environment variables.
	if port, ok := os.LookupEnv("PORT"); ok {
		port, err := strconv.ParseUint(port, 10, 16)
		if err != nil {
			log.Fatal(err)
		}

		conf.Port = uint16(port)
	}

	server, err := endpoint.New(conf)
	if err != nil {
		log.Fatal(err)
	}

	if err := server.Run(); err != nil {
		log.Fatal(err)
	}
}

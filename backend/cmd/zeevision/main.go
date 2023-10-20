package main

import (
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

	// Launch goroutine for consuming from specified topic and partition
	brokers := []string{kafkaAddr}
	kafkaConsumer, err := consumer.NewConsumer(brokers)
	if err != nil {
		// TODO: error handling
		panic("Could not start consuming")
	}
	// The consumer needs to be closed manually because its sub-consumers
	// need to be closed manually
	defer kafkaConsumer.Close()

	topic := "zeebe-deployment"
	msgChannel, err := kafkaConsumer.ConsumeTopic(0, topic)
	if err != nil {
		// TODO: error handling
		panic("Could not start consuming")
	}

	// Create default configuration.
	conf := &endpoint.Config{
		Port: DefaultWebsocketPort,
		// TODO: replace this with a pointer to the consumer, perhaps,
		// so we can simply request the channels we want
		ZeebeMsgChannel: msgChannel,
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

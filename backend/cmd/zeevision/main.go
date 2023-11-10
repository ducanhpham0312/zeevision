package main

import (
	"log"

	"github.com/ducanhpham0312/zeevision/backend/internal/consumer"
	"github.com/ducanhpham0312/zeevision/backend/internal/endpoint"
	"github.com/ducanhpham0312/zeevision/backend/internal/environment"
	"github.com/ducanhpham0312/zeevision/backend/internal/storage"
)

// Entry point for the application.
func main() {

	dsnConfig := storage.DsnConfig{
		User:         "zeevision_user",
		Password:     "zeevision_pass",
		DatabaseName: environment.DatabaseName(),
		Host:         environment.HostDatabase(),
		Port:         environment.DatabasePort(),
	}

	db, err := storage.ConnectDb(dsnConfig)
	if err != nil {
		panic(err)
	}

	err = storage.CreateProcessTable(db)
	if err != nil {
		panic(err)
	}

	// Get Kafka address from environment variable.
	kafkaAddr := environment.KafkaAddress()

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
	_, err = kafkaConsumer.ConsumeTopic(0, topic)
	if err != nil {
		// TODO: error handling
		panic(err)
	}

	// TODO: replace the msgChannel with a pointer to the consumer, perhaps,
	// so we can simply request the channels we want
	server, err := endpoint.NewFromEnv()
	if err != nil {
		log.Fatal(err)
	}

	if err := server.Run(); err != nil {
		log.Fatal(err)
	}
}

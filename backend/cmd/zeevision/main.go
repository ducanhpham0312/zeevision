package main

import (
	"log"
	"time"

	"github.com/ducanhpham0312/zeevision/backend/internal/consumer"
	"github.com/ducanhpham0312/zeevision/backend/internal/endpoint"
	"github.com/ducanhpham0312/zeevision/backend/internal/environment"
	"github.com/ducanhpham0312/zeevision/backend/internal/storage"
)

const (
	DBConnectionRetries    = 5
	DBConnectionRetryDelay = 2 * time.Second

	ConsumerRetries    = 5
	ConsumerRetryDelay = 2 * time.Second
)

// Entry point for the application.
func main() {
	dsnConfig := storage.DsnConfig{
		User:         environment.DatabaseUser(),
		Password:     environment.DatabasePassword(),
		DatabaseName: environment.DatabaseName(),
		Host:         environment.DatabaseHost(),
		Port:         environment.DatabasePort(),
	}

	// Connect to database with retry
	db, err := storage.ConnectDb(dsnConfig, DBConnectionRetries, DBConnectionRetryDelay)
	if err != nil {
		panic(err)
	}

	err = storage.AutoMigrate(db)
	if err != nil {
		panic(err)
	}

	// Create fetcher for fetching data from database.
	fetcher := storage.NewFetcher(db)

	// Get Kafka address from environment variable.
	kafkaAddr := environment.KafkaAddress()

	// Launch goroutine for consuming from specified topic and partition
	storer := storage.NewStorer(db)
	brokers := []string{kafkaAddr}
	kafkaConsumer, err := consumer.NewConsumer(storer, brokers, ConsumerRetries, ConsumerRetryDelay)
	if err != nil {
		panic(err)
	}
	// The consumer needs to be closed manually because its sub-consumers
	// need to be closed manually
	defer kafkaConsumer.Close()

	// TODO these should be stored somewhere else. they don't need to be
	// fixed, so they could be configuration - but the types of messages we
	// can handle are fixed in code, so they should only be changed if the
	// messages we care about move to different topics, or if there are new
	// or removed message types
	topics := []string{
		"zeebe-deployment",
		"zeebe-deployment-distribution",
		"zeebe-error",
		"zeebe-incident",
		"zeebe-job",
		"zeebe-job-batch",
		"zeebe-message",
		"zeebe-message-subscription",
		"zeebe-message-subscription-start-event",
		"zeebe-process",
		"zeebe-process-event",
		"zeebe-process-instance",
		"zeebe-process-instance-result",
		"zeebe-process-message-subscription",
		"zeebe-timer",
		"zeebe-variable",
	}
	for _, topic := range topics {
		err = kafkaConsumer.ConsumeTopic(0, topic)
		if err != nil {
			// TODO: error handling
			panic(err)
		}
	}

	server, err := endpoint.NewFromEnv(fetcher)
	if err != nil {
		log.Fatal(err)
	}

	if err := server.Run(); err != nil {
		log.Fatal(err)
	}
}

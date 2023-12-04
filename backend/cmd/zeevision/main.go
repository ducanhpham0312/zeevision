package main

import (
	"time"

	"github.com/ducanhpham0312/zeevision/backend/internal/consumer"
	"github.com/ducanhpham0312/zeevision/backend/internal/endpoint"
	"github.com/ducanhpham0312/zeevision/backend/internal/environment"
	"github.com/ducanhpham0312/zeevision/backend/internal/storage"
	"go.uber.org/zap"
)

const (
	DBConnectionRetries    = 5
	DBConnectionRetryDelay = 2 * time.Second

	ConsumerRetries    = 5
	ConsumerRetryDelay = 2 * time.Second
)

// Entry point for the application.
func main() {
	zap.L().Info("Starting ...")

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
		zap.L().Panic("Failed connecting to database", zap.Error(err))
	}
	zap.L().Info("Successfully connect to database")

	err = storage.AutoMigrate(db)
	if err != nil {
		zap.L().Panic("Failed migrating tables in database", zap.Error(err))
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
		zap.L().Panic("Failed connecting to Kafka", zap.Strings("brokers", brokers), zap.Error(err))
	}
	zap.L().Info("Successfully connect to Kafka", zap.Strings("brokers", brokers))

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
			zap.L().Panic("Failed consuming", zap.String("topic", topic), zap.Error(err))
		}
	}

	server, err := endpoint.NewFromEnv(fetcher)
	if err != nil {
		zap.L().Fatal("Failed creating a new endpoint from environment variables")
	}

	if err := server.Run(); err != nil {
		zap.L().Fatal("Errors happens when trying to run server")
	}
}

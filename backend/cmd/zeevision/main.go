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
	// Create a global logger
	zap.ReplaceGlobals(zap.Must(zap.NewProduction()))

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
	zap.L().Info("Successfully connected to database")

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
	zap.L().Info("Successfully connected to Kafka", zap.Strings("brokers", brokers))

	// The consumer needs to be closed manually because its sub-consumers
	// need to be closed manually
	defer kafkaConsumer.Close()

	server, err := endpoint.NewFromEnv(fetcher)
	if err != nil {
		zap.L().Fatal("Failed creating a new endpoint from environment variables", zap.Error(err))
	}

	if err := server.Run(); err != nil {
		zap.L().Fatal("Server error", zap.Error(err))
	}
}

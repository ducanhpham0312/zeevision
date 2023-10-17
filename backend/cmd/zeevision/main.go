package main

import (
	"fmt"
	"log"

	"github.com/ducanhpham0312/zeevision/backend/internal/consumer"
	"github.com/ducanhpham0312/zeevision/backend/internal/endpoint"
)

// Entry point for the application.
func main() {
	msgChannel := make(chan []byte)
	// Launch goroutine for consuming from specified topic and partition
	brokers := []string{"127.0.0.1:9092"}
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

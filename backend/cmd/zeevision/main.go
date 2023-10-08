package main

import (
	"fmt"

	"github.com/ducanhpham0312/zeevision/backend/internal/receiver"
)

// Entry point for the application.
func main() {
	msgChannel := make(chan []byte)
	// Launch goroutine for consuming from specified topic and partition
	brokers := []string{"127.0.0.1:9092"}
	go receiver.ConsumeStream(brokers, "zeebe-message", 0, msgChannel)

	for {
		msg := <-msgChannel
		fmt.Sprintf("Message received: %s\n", msg)
	}
}

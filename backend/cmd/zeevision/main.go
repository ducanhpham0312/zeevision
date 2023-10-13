package main
 
import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/ducanhpham0312/zeevision/backend/internal/consumer"
	"github.com/ducanhpham0312/zeevision/backend/internal/endpoint"
)

const DefaultPort = 8080

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

	// Create default configuration.
	conf := &endpoint.Config{
		Port: DefaultPort,
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

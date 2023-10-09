package main

import (
	"log"
	"os"
	"strconv"

	"github.com/ducanhpham0312/zeevision/backend/internal/endpoint"
)

const DefaultPort = 8080

// Entry point for the application.
func main() {
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

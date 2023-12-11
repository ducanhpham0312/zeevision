package kafka_test_data

import (
	"fmt"
	"io"
	"os"
)

// SendMessageToKafka sends a JSON message to Kafka
func SendMessageToKafka() {
	fmt.Println("SENDMESSAGESTOKAFKA TRIGGERED")
	// Read JSON payload from a file
	dir, err := os.Getwd()
	if err != nil {
		os.Exit(1)
	}
	print("DEBUG SEND MESSAGE TO KAFKA: Current dir: ", dir)
	/*jsonPayload, err := readJSONFile("../../kafka_test_data/test.json")
	if err != nil {
		log.Fatalf("Error reading JSON file: %v", err)
	}

	// Create Kafka producer configuration
	config := sarama.NewConfig()
	config.Producer.RequiredAcks = sarama.WaitForLocal

	// Create Kafka producer
	producer, err := sarama.NewAsyncProducer([]string{"kafka:9092"}, config)
	if err != nil {
		log.Fatalf("Error creating Kafka producer: %v", err)
	}
	defer producer.Close()

	// Create a Kafka message
	message := &sarama.ProducerMessage{
		Topic: "test-topic",
		Value: sarama.StringEncoder(jsonPayload),
	}

	// Send message to Kafka
	producer.Input() <- message

	// Wait for the message to be sent (asynchronous)
	select {
	case success := <-producer.Successes():
		log.Printf("Message sent successfully: %v\n", success.Offset)
	case err := <-producer.Errors():
		log.Printf("Failed to send message: %v\n", err.Err)
	}
	*/
}

func readJSONFile(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	byteValue, err := io.ReadAll(file)
	if err != nil {
		return "", err
	}

	return string(byteValue), nil
}

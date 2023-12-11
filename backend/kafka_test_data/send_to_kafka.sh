#!/bin/bash

# Define Kafka broker and topic
KAFKA_BROKER="kafka:9093"
KAFKA_TOPIC="your-kafka-topic"

# Function to send a JSON file to Kafka
send_file() {
    file_path=$1
    cat $file_path | kafka-console-producer --broker-list $KAFKA_BROKER --topic $KAFKA_TOPIC
}

# Send JSON messages from a file to Kafka
send_file "path/to/your/json/file1.json"
send_file "path/to/your/json/file2.json"
send_file "path/to/your/json/file3.json"
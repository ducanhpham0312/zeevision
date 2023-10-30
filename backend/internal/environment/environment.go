// Collection of functions to access environment variables.
//
// When adding a new environment variable:
// 1. add a environment variable name as a constant
// 2. initialize it in the init() function
// 3. add a getter function

package environment

import (
	"os"
	"strconv"
	"strings"
)

const (
	// Environment variable used to configure the Kafka address.
	EnvVarKafkaAddr = "ZEEVISION_KAFKA_ADDR"
	// Environment variable used to configure the port to use for the
	// application deployment.
	EnvVarAppPort = "ZEEVISION_APP_PORT"
	// Environment variable used to configure the address to use for the
	// application.
	EnvVarAppAddress = "ZEEVISION_APP_ADDRESS"
	// Environment variable used to configure the port to use for the API.
	EnvVarAPIPort = "ZEEVISION_API_PORT"
	// Environment variable used to configure the production mode.
	EnvVarProduction = "ZEEVISION_PROD"
	// Environment variable used to configure if the application should be
	// hosted.
	EnvVarHostApp = "ZEEVISION_HOST_APP"
	// Environment variable used to configure if the playground should be
	// hosted.
	EnvVarHostPlayground = "ZEEVISION_HOST_PLAYGROUND"
	// Environment variable used to configure the allowed origins for
	// accessing the API.
	EnvVarAPIAllowedOrigins = "ZEEVISION_API_ALLOWED_ORIGINS"
)

const (
	// Default Kafka address to use.
	DefaultKafkaAddr = "kafka:9093"
	// Default port to use for the application.
	DefaultAppPort = 8080
	// Default port to use for the API.
	DefaultAPIPort = 8081
	// Default value for production mode.
	DefaultProduction = false
	// Default value for hosting the application.
	DefaultHostApp = false
	// Default value for hosting the playground.
	DefaultHostPlayground = false
)

var (
	// Default value for allowed origins. None are allowed.
	DefaultAPIAllowedOrigins = []string{}
)

var cache map[string]any

// This function is automatically called before main() to initialize the
// environment variables.
func init() {
	cache = make(map[string]any)

	setOrFallback(EnvVarKafkaAddr, DefaultKafkaAddr)

	setOrFallbackMap(EnvVarAppPort, DefaultAppPort, parsePort)
	setOrFallbackMap(EnvVarAPIPort, DefaultAPIPort, parsePort)

	setOrFallbackMap(EnvVarProduction, DefaultProduction, isOne)
	setOrFallbackMap(EnvVarHostApp, DefaultHostApp, isOne)
	setOrFallbackMap(EnvVarHostPlayground, DefaultHostPlayground, isOne)

	setOrFallbackMap(EnvVarAPIAllowedOrigins, DefaultAPIAllowedOrigins, func(s string) ([]string, bool) {
		return strings.Split(s, ","), true
	})
}

// Return the full address for Kafka where consumer can connect.
func KafkaAddress() string {
	return cache[EnvVarKafkaAddr].(string)
}

// Return the port the application is hosted at.
func AppPort() uint16 {
	return cache[EnvVarAppPort].(uint16)
}

// Return the port the API is hosted at.
func APIPort() uint16 {
	return cache[EnvVarAPIPort].(uint16)
}

// Return whether the application is running in production mode or not.
func IsProduction() bool {
	return cache[EnvVarProduction].(bool)
}

// Return whether the application should host the application too or only
// the API.
func DoHostApp() bool {
	return cache[EnvVarHostApp].(bool)
}

// Return whether the application should host the GraphQL playground for the
// API.
func DoHostPlayground() bool {
	return cache[EnvVarHostPlayground].(bool)
}

// Return the set of allowed origins for API access.
func APIAllowedOrigins() []string {
	return cache[EnvVarAPIAllowedOrigins].([]string)
}

// Helper to save environment variable value if it has been set.
func setOrFallback(envVar string, fallback string) {
	setOrFallbackMap(envVar, fallback, func(s string) (string, bool) {
		return s, true
	})
}

// Helper to save environment variable value if it has been set with a mapper
// function to map the string value to the desired type.
//
// `mapper` is a function that takes a string and returns the mapped value and
// a boolean indicating if the mapping was successful.
func setOrFallbackMap[T any](envVar string, fallback T, mapper func(string) (T, bool)) {
	if value, ok := os.LookupEnv(envVar); ok {
		if mappedValue, ok := mapper(value); ok {
			cache[envVar] = mappedValue
			return
		}
	}

	cache[envVar] = fallback
}

// Helper to parse a string to a port number.
func parsePort(value string) (uint16, bool) {
	port, err := strconv.ParseInt(value, 10, 16)
	return uint16(port), err == nil
}

// Helper to parse string "1" to a boolean.
func isOne(value string) (bool, bool) {
	return value == "1", true
}

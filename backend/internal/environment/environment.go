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
)

const (
	// Environment variable used to configure the Kafka address.
	EnvVarKafkaAddr      = "ZEEVISION_KAFKA_ADDR"
	EnvVarAppPort        = "ZEEVISION_APP_PORT"
	EnvVarAPIPort        = "ZEEVISION_API_PORT"
	EnvVarProd           = "ZEEVISION_PROD"
	EnvVarHostApp        = "ZEEVISION_HOST_APP"
	EnvVarHostPlayground = "ZEEVISION_HOST_PLAYGROUND"
)

const (
	// Default Kafka address to use.
	DefaultKafkaAddr = "kafka:9093"
	// Default port to use for the application.
	DefaultAppPort = 8080
	// Default port to use for the API.
	DefaultAPIPort = 8081
)

var cache map[string]string

// This function is automatically called before main() to initialize the
// environment variables.
func init() {
	cache = make(map[string]string)

	cacheIfSet(EnvVarKafkaAddr)
	cacheIfSet(EnvVarAppPort)
	cacheIfSet(EnvVarAPIPort)
	cacheIfSet(EnvVarProd)
	cacheIfSet(EnvVarHostApp)
	cacheIfSet(EnvVarHostPlayground)
}

func KafkaAddress() string {
	return getOrFallback(EnvVarKafkaAddr, DefaultKafkaAddr)
}

func AppPort() uint16 {
	return portEnvVar(EnvVarAppPort, DefaultAppPort)
}

func APIPort() uint16 {
	return portEnvVar(EnvVarAPIPort, DefaultAPIPort)
}

func IsProduction() bool {
	return cache[EnvVarProd] == "1"
}

func DoHostApp() bool {
	return cache[EnvVarHostApp] == "1"
}

func DoHostPlayground() bool {
	return cache[EnvVarHostPlayground] == "1"
}

// Helper to cache environment variable value if it has been set.
func cacheIfSet(envVar string) {
	if value, ok := os.LookupEnv(envVar); ok {
		cache[envVar] = value
	}
}

// Helper to get environment variable value or fallback to a default value.
func getOrFallback(envVar, fallback string) string {
	if value, ok := cache[envVar]; ok {
		return value
	}

	return fallback
}

// Helper to get port environment variable value or fallback to a default value.
func portEnvVar(envVar string, fallback uint16) uint16 {
	portStr, ok := cache[envVar]
	if !ok {
		return fallback
	}
	port, err := strconv.ParseUint(portStr, 10, 16)
	if err != nil {
		return fallback
	}
	return uint16(port)
}

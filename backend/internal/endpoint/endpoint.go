package endpoint

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/mandrigin/gin-spa/spa"
	"golang.org/x/sync/errgroup"
)

const (
	// Path where the application is served.
	AppPath = "/"
	// Internal path where the application files are stored.
	AppTargetPath = "./static"

	// Path where the API is served.
	WebsocketPath = "/ws"

	// Environment variables used to configure the endpoint.
	EnvVarAppPort = "ZEEVISION_APP_PORT"
	EnvVarAPIPort = "ZEEVISION_API_PORT"
	EnvVarProd    = "ZEEVISION_PROD"

	// Default port values.
	DefaultAppPort = 8080
	DefaultAPIPort = 8081

	ServerReadTimeoutSecs  = 5
	ServerWriteTimeoutSecs = 10
)

// Configuration used to create a new endpoint.
type Config struct {
	// The port used to host the application.
	AppPort uint16
	// The port used to host the API.
	APIPort uint16
	// Whether the endpoint is running in production mode.
	// This defines if the endpoint should serve also the application
	// files or not.
	Production bool
}

// Endpoint represents a server that handles incoming requests.
type Endpoint struct {
	appServer *http.Server
	apiServer *http.Server
}

// TODO the use of msgChannel throughout represents a temporary solution to
// passing consumer data through

// Create a new endpoint from environment variables.
//
// App and API ports can be configured by setting the environment variables
// APP_PORT and API_PORT respectively.
func NewFromEnv(msgChannel chan []byte) (*Endpoint, error) {
	// Create default configuration.
	conf := Config{
		AppPort:    DefaultAppPort,
		APIPort:    DefaultAPIPort,
		Production: false,
	}

	// Override configuration with environment variables.
	if port, ok := os.LookupEnv(EnvVarAPIPort); ok {
		port, err := strconv.ParseUint(port, 10, 16)
		if err != nil {
			return nil, err
		}

		conf.APIPort = uint16(port)
	}

	if port, ok := os.LookupEnv(EnvVarAppPort); ok {
		port, err := strconv.ParseUint(port, 10, 16)
		if err != nil {
			return nil, err
		}

		conf.AppPort = uint16(port)
	}

	if prod, ok := os.LookupEnv(EnvVarProd); ok && prod == "true" {
		conf.Production = true
	}

	return New(conf, msgChannel)
}

// Create a new endpoint.
func New(conf Config, msgChannel chan []byte) (*Endpoint, error) {
	var appServer *http.Server
	if conf.Production {
		var err error
		appServer, err = NewAppServer(conf.AppPort)
		if err != nil {
			return nil, err
		}
	}

	apiServer, err := NewAPIServer(conf.APIPort, msgChannel)
	if err != nil {
		return nil, err
	}

	return &Endpoint{
		appServer: appServer,
		apiServer: apiServer,
	}, nil
}

// Create a new application server.
func NewAppServer(port uint16) (*http.Server, error) {
	r := gin.Default()

	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	r.Use(spa.Middleware(AppPath, AppTargetPath))

	return &http.Server{
		Addr:         fmt.Sprintf(":%d", port),
		Handler:      r,
		ReadTimeout:  ServerReadTimeoutSecs * time.Second,
		WriteTimeout: ServerWriteTimeoutSecs * time.Second,
	}, nil
}

// Create a new API server.
func NewAPIServer(port uint16, msgChannel chan []byte) (*http.Server, error) {
	r := gin.Default()

	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// Ignore proxy headers.
	_ = r.SetTrustedProxies(nil)

	upgrader := newUpgrader()
	r.GET(WebsocketPath, func(ctx *gin.Context) {
		websocketTunnel(ctx, upgrader)
	})

	return &http.Server{
		Addr:         fmt.Sprintf(":%d", port),
		Handler:      r,
		ReadTimeout:  ServerReadTimeoutSecs * time.Second,
		WriteTimeout: ServerWriteTimeoutSecs * time.Second,
	}, nil
}

// Run the endpoint.
//
// This will block the current goroutine.
func (e *Endpoint) Run() error {
	var g errgroup.Group

	// Run the application server if it has been configured.
	if e.appServer != nil {
		g.Go(func() error {
			return e.appServer.ListenAndServe()
		})
	}

	g.Go(func() error {
		return e.apiServer.ListenAndServe()
	})

	return g.Wait()
}

package endpoint

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
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

// Create a new endpoint from environment variables.
//
// App and API ports can be configured by setting the environment variables
// APP_PORT and API_PORT respectively.
func NewFromEnv() (*Endpoint, error) {
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

	return New(conf)
}

// Create a new endpoint.
func New(conf Config) (*Endpoint, error) {
	var appServer *http.Server
	if conf.Production {
		var err error
		appServer, err = NewAppServer(conf.AppPort)
		if err != nil {
			return nil, err
		}
	}

	apiServer, err := NewAPIServer(conf.APIPort)
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
func NewAPIServer(port uint16) (*http.Server, error) {
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

// Handle websocket tunnel for each new connection.
func websocketTunnel(ctx *gin.Context, upgrader *websocket.Upgrader) {
	writer, request := ctx.Writer, ctx.Request

	conn, err := upgrader.Upgrade(writer, request, nil)
	if err != nil {
		log.Println("upgrade:", err)
		return
	}
	defer conn.Close()

	// Send sample message to client every second.
	msgNum := 1
	for {
		msg := fmt.Sprintf("Hello, world! msg number: %d", msgNum)
		msgNum++

		err := conn.WriteMessage(websocket.TextMessage, []byte(msg))
		if err != nil {
			log.Println("write:", err)
			break
		}

		time.Sleep(time.Second)
	}
}

// Create a new upgrader for creating the websocket connection.
func newUpgrader() *websocket.Upgrader {
	// Allow all origins.
	checkOrigin := func(r *http.Request) bool {
		return true
	}

	return &websocket.Upgrader{
		CheckOrigin: checkOrigin,
	}
}

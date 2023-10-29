package endpoint

import (
	"fmt"
	"net/http"
	"time"

	qlhandler "github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/ducanhpham0312/zeevision/backend/graph"
	"github.com/ducanhpham0312/zeevision/backend/internal/environment"
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
	APIPath        = "/graphql"
	PlaygroundPath = "/playground"

	PlaygroundTitle = "ZeeVision Playground"

	ServerReadTimeoutSecs  = 5
	ServerWriteTimeoutSecs = 10
	KeepAlivePingInterval  = 5
)

// Configuration used to create a new endpoint.
type Config struct {
	// The port used to host the application.
	AppPort uint16
	// The port used to host the API.
	APIPort uint16
	// This defines if the endpoint should serve also the application
	// files or not.
	DoHostApp bool
}

// Endpoint represents a server that handles incoming requests.
type Endpoint struct {
	appServer *http.Server
	apiServer *http.Server
}

// Create a new endpoint from environment variables.
func NewFromEnv() (*Endpoint, error) {
	// Create configuration from environment variables.
	conf := Config{
		AppPort:   environment.AppPort(),
		APIPort:   environment.APIPort(),
		DoHostApp: environment.DoHostApp(),
	}

	return New(conf)
}

// Create a new endpoint.
func New(conf Config) (*Endpoint, error) {
	var appServer *http.Server
	if conf.DoHostApp {
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
	// Setup GraphQL schema options.
	rootResolver := &graph.Resolver{}
	config := graph.Config{Resolvers: rootResolver}
	schema := graph.NewExecutableSchema(config)

	// Setup API server.
	api := qlhandler.New(schema)
	api.AddTransport(transport.Websocket{
		Upgrader:              newUpgrader(),
		KeepAlivePingInterval: KeepAlivePingInterval,
	})
	api.AddTransport(transport.Options{})
	api.AddTransport(transport.GET{})
	api.AddTransport(transport.POST{})
	api.AddTransport(transport.MultipartForm{})

	api.SetQueryCache(lru.New(1000))

	api.Use(extension.Introspection{})
	api.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New(100),
	})

	// Create mux to handle API and playground.
	mux := http.NewServeMux()
	mux.Handle(APIPath, api)

	// Host GraphQL playground if it has been configured.
	if environment.DoHostPlayground() {
		mux.Handle(PlaygroundPath, playground.Handler(PlaygroundTitle, APIPath))
	}

	return &http.Server{
		Addr:         fmt.Sprintf(":%d", port),
		Handler:      mux,
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

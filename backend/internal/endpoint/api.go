package endpoint

import (
	"net/http"

	qlhandler "github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/ducanhpham0312/zeevision/backend/graph"
	"github.com/ducanhpham0312/zeevision/backend/internal/storage"
	"github.com/gorilla/websocket"
)

const (
	QueryCacheSize     = 1000
	PersistedQuerySize = 100

	KeepAlivePingInterval = 5
)

func newAPIHandler(fetcher *storage.Fetcher) *qlhandler.Server {
	// Setup GraphQL schema options.
	rootResolver := &graph.Resolver{Fetcher: fetcher}
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

	api.SetQueryCache(lru.New(QueryCacheSize))

	api.Use(extension.Introspection{})
	api.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New(PersistedQuerySize),
	})

	return api
}

// Create a new upgrader for creating the websocket connection.
func newUpgrader() websocket.Upgrader {
	// Allow all origins.
	checkOrigin := func(r *http.Request) bool {
		return true
	}

	return websocket.Upgrader{
		CheckOrigin: checkOrigin,
	}
}

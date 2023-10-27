package endpoint

import (
	"net/http"

	"github.com/ducanhpham0312/zeevision/backend/internal/endpoint/handler"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	log "github.com/sirupsen/logrus"
	"golang.org/x/sync/errgroup"
)

const (
	ResponseChannelBufferSize = 16
)

// Handle websocket tunnel for each new connection.
func websocketTunnel(ctx *gin.Context, upgrader *websocket.Upgrader) {
	writer, request := ctx.Writer, ctx.Request

	conn, err := upgrader.Upgrade(writer, request, nil)
	if err != nil {
		log.Println("upgrade:", err)
		return
	}
	defer conn.Close()

	responseChannel := make(chan handler.Response, ResponseChannelBufferSize)

	var g errgroup.Group
	g.Go(func() error {
		return websocketWriter(conn, responseChannel)
	})
	g.Go(func() error {
		// TODO: should have only one handler mux for all connections
		handlers := handler.NewMux()
		return websocketReader(conn, responseChannel, handlers)
	})

	if err := g.Wait(); err != nil {
		log.Warn("endpoint: ", err)
	}

	// TODO: websocket soft close
}

func websocketWriter(conn *websocket.Conn, responseChan <-chan handler.Response) error {
	// Write responses until the channel is closed.
	for response := range responseChan {
		// We must write responses synchronously because websocket connection
		// writer is not thread-safe.
		if err := conn.WriteJSON(response); err != nil {
			log.Error("websocket write: ", err)
		}
	}

	return nil
}

func websocketReader(conn *websocket.Conn, responseChan chan<- handler.Response, handlers *handler.Mux) error {
	// Close the response channel in the end so the response writer can exit.
	defer close(responseChan)

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Error("websocket read: ", err)
			return err
		}

		// Handle the request asynchronously.
		go func() {
			responseChan <- handlers.HandleRequest(msg)
		}()
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

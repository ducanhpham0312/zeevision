package endpoint

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// Configuration used to create a new endpoint.
type Config struct {
	// The port used to host the server.
	Port uint16
	ZeebeMsgChannel chan []byte
}

// Endpoint represents a server that handles incoming requests.
type Endpoint struct {
	router  *gin.Engine
	address string
}

// Create a new endpoint.
func New(conf *Config) (*Endpoint, error) {
	router := gin.Default()
	address := fmt.Sprintf("0.0.0.0:%d", conf.Port)

	upgrader := newUpgrader()

	router.GET("/ws", func(ctx *gin.Context) {
		websocketTunnel(ctx, upgrader)
	})

	// TODO: disable for now, investigate later.
	_ = router.SetTrustedProxies(nil)

	return &Endpoint{
		router:  router,
		address: address,
	}, nil
}

// Run the endpoint.
//
// This will block the current goroutine.
func (e *Endpoint) Run() error {
	return e.router.Run(e.address)
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
	// TODO: allow only the reverse proxy to connect.
	checkOrigin := func(r *http.Request) bool {
		return true
	}

	return &websocket.Upgrader{
		CheckOrigin: checkOrigin,
	}
}

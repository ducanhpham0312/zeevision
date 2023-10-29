package endpoint

import (
	"net/http"

	"github.com/gorilla/websocket"
)

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

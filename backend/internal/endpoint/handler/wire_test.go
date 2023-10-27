package handler

import (
	"net/url"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestUrl(t *testing.T) {
	u, err := url.Parse("http://localhost:8080/processes/1")
	assert.NoError(t, err)

	assert.Equal(t, "/processes/1", u.Path)
}

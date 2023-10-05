package example

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

// TODO(kauppie): remove this dummy test.
func TestHelloWorld(t *testing.T) {
	hello := HelloWorld()

	assert.Equal(t, 12, len(hello))
	assert.Equal(t, "Hello world!", hello)
}

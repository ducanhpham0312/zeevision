package storage

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

const DSN = "user=user password=password dbname=zeevision_db host=postgres port=5432"

func TestNewDsn(t *testing.T) {
	dsnConfig := DsnConfig{
		User:         "user",
		Password:     "password",
		DatabaseName: "zeevision_db",
		Host:         "postgres",
		Port:         5432,
	}

	result := dsnConfig.String()
	assert.Equal(t, result, DSN)
}

package storage

import (
	"testing"

	"github.com/ducanhpham0312/zeevision/backend/internal/environment"
	"github.com/stretchr/testify/assert"
)

const DSN = "user=user password=password dbname=zeevision_db host=postgres port=5432"

func TestNewDsn(t *testing.T) {
	dsnConfig := DsnConfig{
		User:         "user",
		Password:     "password",
		DatabaseName: environment.DatabaseName(),
		Host:         environment.HostDatabase(),
		Port:         environment.DatabasePort(),
	}

	result := dsnConfig.NewDsn()
	assert.Equal(t, result, DSN)
}

package storage

import (
	"testing"

	"github.com/ducanhpham0312/zeevision/backend/internal/environment"
)

func TestAdd(t *testing.T) {
	dsnConfig := DsnConfig{
		User:         environment.DatabaseUser(),
		Password:     environment.DatabasePassword(),
		DatabaseName: environment.DatabaseName(),
		Host:         "postgres",
		Port:         environment.DatabasePort(),
	}

	db := ConnectDb(dsnConfig)

	CreateInstanceTable(db)
}

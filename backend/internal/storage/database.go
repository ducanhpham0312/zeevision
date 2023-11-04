package storage

import (
	"github.com/ducanhpham0312/zeevision/backend/graph/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func connectDB() *gorm.DB {
	dsn := "user=username password=password dbname=mydb host=localhost port=5432 sslmode=disable"

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err)
	}

	return db
}

func createTables() {
	db := connectDB()
	err := db.AutoMigrate(&model.Instance{}, &model.Process{}, &model.MessageSubscription{}, &model.Timer{})
	if err != nil {
		panic(err)
	}
}

package storage

import (
	"github.com/ducanhpham0312/zeevision/backend/graph/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func connectDb() (*gorm.DB, error) {
	dsn := "user=zeevision_user password=zeevision_pass dbname=zeevision_db host=localhost port=5432 sslmode=disable"

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	return db, nil
}

func createTables() {
	db, err := connectDb()
	if err != nil {
		panic("Failed to connect to the database: " + err.Error())
	}

	err = db.AutoMigrate(&model.Instance{})
	if err != nil {
		panic("Failed to create tables: " + err.Error())
	}
}

//&model.Process{}, &model.Timer{}, &model.MessageSubscription{}

package storage

// Process model struct for database table
type Process struct {
	ProcessID    uint   `gorm:"primaryKey"`
	ProcessKey   uint   `gorm:"unique;not null"`
	BpmnResource string `gorm:"not null"`
}

// Package store handles MongoDB persistence for code submissions.
//
// The Store is intentionally tolerant: if MongoDB is not configured or
// unreachable, NewStore returns a Store with a nil collection and every method
// becomes a safe no-op (returning a generated id). This lets the runner work in
// environments where persistence is not yet wired without faking data.
package store

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Submission is one code run. Source/Stdin are persisted but omitted from JSON
// responses to keep payloads small and avoid echoing large inputs back.
type Submission struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Language  string             `bson:"language"      json:"language"`
	Source    string             `bson:"source"        json:"-"`
	Stdin     string             `bson:"stdin,omitempty" json:"-"`
	Status    string             `bson:"status"        json:"status"`
	Stdout    string             `bson:"stdout"        json:"stdout"`
	Stderr    string             `bson:"stderr"        json:"stderr"`
	ExitCode  int                `bson:"exitCode"      json:"exitCode"`
	TimeMs    int64              `bson:"timeMs"        json:"timeMs"`
	UserID    string             `bson:"userId,omitempty" json:"userId,omitempty"`
	CreatedAt time.Time          `bson:"createdAt"     json:"createdAt"`
}

type Store struct {
	client *mongo.Client
	col    *mongo.Collection
}

// Connect dials MongoDB. When uri is empty it returns a no-op store (col == nil).
func Connect(ctx context.Context, uri, dbName string) (*Store, error) {
	if uri == "" {
		return &Store{}, nil
	}
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}
	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	if err := client.Ping(pingCtx, nil); err != nil {
		return nil, err
	}
	col := client.Database(dbName).Collection("code_submissions")
	// Best-effort indexes — ignore errors so a read-only role still boots.
	_, _ = col.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "userId", Value: 1}, {Key: "createdAt", Value: -1}}},
		{Keys: bson.D{{Key: "createdAt", Value: -1}}},
	})
	return &Store{client: client, col: col}, nil
}

// Enabled reports whether persistence is active.
func (s *Store) Enabled() bool { return s != nil && s.col != nil }

// Create inserts a submission and returns its id. When persistence is disabled
// it returns a fresh ObjectID without writing, so callers always get an id.
func (s *Store) Create(ctx context.Context, sub *Submission) (primitive.ObjectID, error) {
	if sub.CreatedAt.IsZero() {
		sub.CreatedAt = time.Now().UTC()
	}
	if !s.Enabled() {
		if sub.ID.IsZero() {
			sub.ID = primitive.NewObjectID()
		}
		return sub.ID, nil
	}
	res, err := s.col.InsertOne(ctx, sub)
	if err != nil {
		return primitive.NilObjectID, err
	}
	id, _ := res.InsertedID.(primitive.ObjectID)
	sub.ID = id
	return id, nil
}

// Update writes the terminal result fields for a submission.
func (s *Store) Update(ctx context.Context, id primitive.ObjectID, sub *Submission) error {
	if !s.Enabled() {
		return nil
	}
	_, err := s.col.UpdateByID(ctx, id, bson.M{"$set": bson.M{
		"status":   sub.Status,
		"stdout":   sub.Stdout,
		"stderr":   sub.Stderr,
		"exitCode": sub.ExitCode,
		"timeMs":   sub.TimeMs,
	}})
	return err
}

// FindByID loads a submission. Returns (nil, nil) when not found or disabled.
func (s *Store) FindByID(ctx context.Context, id primitive.ObjectID) (*Submission, error) {
	if !s.Enabled() {
		return nil, nil
	}
	var sub Submission
	err := s.col.FindOne(ctx, bson.M{"_id": id}).Decode(&sub)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &sub, nil
}

// Disconnect closes the client.
func (s *Store) Disconnect(ctx context.Context) {
	if s != nil && s.client != nil {
		_ = s.client.Disconnect(ctx)
	}
}

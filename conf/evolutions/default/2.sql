# --- Second database schema

# --- !Ups

CREATE TABLE users (
  login                     VARCHAR(255) PRIMARY KEY,
  password                  VARCHAR(255) NOT NULL,
  profile                   VARCHAR(255) NOT NULL
);

# --- !Downs

DROP TABLE IF EXISTS users;
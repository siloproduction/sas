# --- First database schema

# --- !Ups

CREATE TABLE greeting (
  id                        SERIAL PRIMARY KEY,
  name                      VARCHAR(255) NOT NULL,
  repeat                    INTEGER NOT NULL,
  color                     VARCHAR(255) NOT NULL
);

CREATE TABLE user (
  login                     VARCHAR(255) PRIMARY KEY,
  password                  VARCHAR(255) NOT NULL,
  profile                   VARCHAR(255) NOT NULL
);

# --- !Downs

DROP TABLE IF EXISTS greeting;
DROP TABLE IF EXISTS user;
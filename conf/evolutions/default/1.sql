# --- First database schema

# --- !Ups

CREATE TABLE greeting (
  id                        SERIAL PRIMARY KEY,
  name                      VARCHAR(255) NOT NULL,
  repeat                    INTEGER NOT NULL,
  color                     VARCHAR(255) NOT NULL
);

# --- !Downs

DROP TABLE IF EXISTS greeting;

# --- !Ups
CREATE TABLE users (
  id                        SERIAL PRIMARY KEY,
  email                     VARCHAR(255) NOT NULL,
  login                     VARCHAR(255) NOT NULL,
  password                  VARCHAR(255) NOT NULL,
  profile                   VARCHAR(255) NOT NULL,
  UNIQUE(email)
);
INSERT INTO users (email, login, password, profile) VALUES ('admin@global.local', 'admin', '$2a$12$L/rFVHZonEAmydEfZyYR.exvJuDdMY6kX7BIdXcam.voTxeBc7YwK', 'Admin');
INSERT INTO users (email, login, password, profile) VALUES ('user@global.local', 'user', '$2a$12$3.UvEUatM.2VbYEI2Y.YKeqn3QNc/k0h9S0Vde2vqvzScKt74ofaS', 'User');

CREATE TABLE events (
  id                        SERIAL PRIMARY KEY,
  name                      VARCHAR(255) NOT NULL,
  userId                    BIGINT references users(id)
);
INSERT INTO events (name, userId) VALUES ('event1', 1);
INSERT INTO events (name, userId) VALUES ('event2', 1);
INSERT INTO events (name, userId) VALUES ('event3', 1);


# --- !Downs
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;


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

CREATE TABLE category (
  id                        SERIAL PRIMARY KEY,
  name                      VARCHAR(255) NOT NULL,
  parent                    BIGINT DEFAULT NULL references category(id),
  link                      VARCHAR(255) DEFAULT NULL,
  rank                      INTEGER NOT NULL,
  enabled                   BOOLEAN  NOT NULL DEFAULT 'TRUE',
  UNIQUE (name,parent)
);
insert into category(id, name, rank, enabled) values (0, 'None', 1, FALSE);

CREATE TABLE page (
  id                        SERIAL PRIMARY KEY,
  name                      VARCHAR(255) NOT NULL,
  categoryId                BIGINT references category(id),
  permanentLink             VARCHAR(255) DEFAULT NULL,
  data                      TEXT NOT NULL DEFAULT '',
  rank                      INTEGER NOT NULL,
  enabled                   BOOLEAN  NOT NULL DEFAULT 'TRUE'
);
INSERT INTO page (name, categoryId, permanentLink, data, rank, enabled) VALUES
                ('PRESENTATION', 0, 'accueil_presentation', 'UNE PRESENTATION', 1, true);
INSERT INTO page (name, categoryId, permanentLink, data, rank, enabled) VALUES
                ('NEWS', 0, 'accueil_news', 'LES NEWS', 1, true);

# --- !Downs

DROP TABLE IF EXISTS page;
DROP TABLE IF EXISTS users, category;

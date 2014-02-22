# --- Second database schema

# --- !Ups

CREATE TABLE users (
  login                     VARCHAR(255) PRIMARY KEY,
  password                  VARCHAR(255) NOT NULL,
  profile                   VARCHAR(255) NOT NULL
);
INSERT INTO users (login, password, profile) VALUES ('admin', 'admin', 'Admin');
INSERT INTO users (login, password, profile) VALUES ('user', 'user', 'User');

CREATE TABLE category (
  id                        SERIAL PRIMARY KEY,
  name                      VARCHAR(255) NOT NULL,
  parent                    BIGINT DEFAULT NULL references category(id),
  link                      VARCHAR(255) DEFAULT '',
  rank                      INTEGER NOT NULL,
  enabled                   BOOLEAN  NOT NULL DEFAULT 'TRUE',
  UNIQUE (name,parent)
);
insert into category(id, name, rank, enabled) values (0, 'None', 1, TRUE);

CREATE TABLE page (
  id                        SERIAL PRIMARY KEY,
  name                      VARCHAR(255) NOT NULL,
  categoryId                BIGINT DEFAULT NULL references category(id),
  permanentLink             VARCHAR(255) DEFAULT NULL,
  data                      TEXT NOT NULL DEFAULT '',
  rank                      INTEGER NOT NULL,
  enabled                   BOOLEAN  NOT NULL DEFAULT 'TRUE'
);
INSERT INTO page VALUES (1, 'PRESENTATION', NULL, 'accueil_presentation', 'UNE PRESENTATION', 1, true);
INSERT INTO page VALUES (2, 'NEWS', NULL, 'accueil_news', 'LES NEWS', 1, true);

# --- !Downs

DROP TABLE IF EXISTS users, category, page;

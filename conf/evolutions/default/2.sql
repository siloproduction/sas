# --- Second database schema

# --- !Ups

CREATE TABLE users (
  login                     VARCHAR(255) PRIMARY KEY,
  password                  VARCHAR(255) NOT NULL,
  profile                   VARCHAR(255) NOT NULL
);

CREATE TABLE category (
  id                        SERIAL PRIMARY KEY,
  name                      VARCHAR(255) NOT NULL,
  parent                    BIGINT DEFAULT NULL references category(id),
  link                      VARCHAR(255) DEFAULT '',
  rank                      INTEGER NOT NULL,
  enabled                   BOOLEAN  NOT NULL DEFAULT 'TRUE'
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

# --- !Downs

DROP TABLE IF EXISTS users, category, page;

# --- Second database schema

# --- !Ups

CREATE TABLE users (
  login                     VARCHAR(255) PRIMARY KEY,
  password                  VARCHAR(255) NOT NULL,
  profile                   VARCHAR(255) NOT NULL
);

CREATE TABLE category (
  name                      VARCHAR(255) NOT NULL,
  parent                    VARCHAR(255) DEFAULT '',
  link                      VARCHAR(255) DEFAULT NULL,
  rank                      INTEGER NOT NULL,
  enabled                   BOOLEAN  NOT NULL DEFAULT 'TRUE',
  CONSTRAINT name_parent    PRIMARY KEY(name,parent)
);
insert into category(name, rank, enabled) values ('', 1, TRUE);

CREATE TABLE page (
  name                      VARCHAR(255) NOT NULL,
  category                  VARCHAR(255) references category(name),
  permanentLink             VARCHAR(255) DEFAULT NULL,
  data                      TEXT NOT NULL DEFAULT '',
  rank                      INTEGER NOT NULL,
  enabled                   BOOLEAN  NOT NULL DEFAULT 'TRUE',
  CONSTRAINT name_category  PRIMARY KEY(name,category)
);

# --- !Downs

DROP TABLE IF EXISTS users, category, page;

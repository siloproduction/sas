package models

import play.api.db._
import play.api.Play.current
import anorm._
import anorm.SqlParser._
import play.api.libs.json.Json
import play.api.libs.json._

case class User(id: Pk[Long], email: String, login: String, password: String, profile: String)


object User {
  private val UserParser: RowParser[User] = {
    get[Pk[Long]]("id") ~
      get[String]("name") map {
      case id ~ name  => User(id, name)
    }
  }
/*
  def findAll(): Seq[User] = {
    DB.withConnection { implicit connection =>
      SQL("select * from users").as(UserParser *)
    }
  }

  def find(id: Int): Option[User] = {
    DB.withConnection { implicit connection =>
      SQL("SELECT * from users WHERE id = {id}")
        .on('id -> id)
        .as(UserParser.singleOpt)
    }
  }

  def save(name: String) {
    DB.withConnection { implicit connection =>
      SQL("""
            INSERT INTO users(name)
            VALUES({name})
          """).on(
          'name -> name)
        .executeUpdate
    }
  }*/
}



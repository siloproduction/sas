package models

import play.api.db._
import play.api.Play.current

import anorm._
import anorm.SqlParser._
import play.api.libs.json.Json
import play.api.libs.json._

case class Event(id: Pk[Long], name: String, userId: Pk[Long])

object Event {
  private val EventParser: RowParser[Event] = {
    get[Pk[Long]]("id") ~
    get[String]("name") ~
    get[Pk[Long]]("userId") map {
      case id ~ name ~ userId => Event(id, name, userId)
    }
  }

  def findAll(): Seq[Event] = {
    DB.withConnection { implicit connection =>
      SQL("select * from events").as(EventParser *)
    }
  }

  def find(id: Int): Option[Event] = {
    DB.withConnection { implicit connection =>
      SQL("SELECT * from events WHERE id = {id}")
        .on('id -> id)
        .as(EventParser.singleOpt)
    }
  }

  def save(name: String) {
    DB.withConnection { implicit connection =>
      SQL("""
            INSERT INTO events(name)
            VALUES({name}, 0)
          """).on(
        'name -> name)
      .executeUpdate
    }
  }
}



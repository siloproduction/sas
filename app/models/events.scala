package models

import play.api.db._
import play.api.Play.current
import anorm._
import anorm.SqlParser._
import play.api.libs.json.Json
import play.api.libs.json._
import play.api.libs.functional.syntax._

case class Event(id: Pk[Long], name: String, userId: Pk[Long])

object Event {

  /*implicit val eventWrites: Writes[Event] = (
    (JsPath \ "id").write[Pk[Long]] and
      (JsPath \ "name").write[String] and
      (JsPath \ "userId").writeNullable[Pk[Long]]
    )(unlift(Event.unapply))*/
  implicit def pkWrites[T : Writes]: Writes[Pk[T]] = Writes {
    case anorm.Id(t) => implicitly[Writes[T]].writes(t)
    case anorm.NotAssigned => JsNull
  }
  implicit val eventWrites = Json.writes[Event]


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



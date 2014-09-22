package json

import play.api.libs.json._
import play.api.libs.json.JsString
import play.api.libs.functional.syntax._
import scala.collection.Traversable
import scala.Traversable
import play.api.libs.json.Json._
import play.api.libs.json.JsArray
import models.Event
import play.api.libs.json.JsSuccess
import play.api.libs.json.JsString
import scala.Some
import play.api.libs.json.JsNumber
/*
object JsonWriters {
  implicit val eventReads: Reads[Event] = (
    (__ \ "id").read[Long] ~
      (__ \ "name").read[String] ~
    )(Event.apply _)

  implicit val eventWrites = new Writes[Event] {
    def writes(event: Event) = Json.obj(
      "id" -> event.id,
      "name" -> event.name
    )
  }
}*/
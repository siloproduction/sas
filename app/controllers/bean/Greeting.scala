package controllers.bean

import play.api.data.Form

import play.api._
import play.api.mvc._
import play.api.data._
import play.api.data.Forms._

case class Greeting(name: String, repeat: Int, color: Option[String])
object GreetingForm {

  def create() =  {
    Form(mapping(
      "name" -> nonEmptyText,
      "repeat" -> number(min = 1, max = 100),
      "color" -> optional(text)
    )(Greeting.apply)(Greeting.unapply)
    )
  }
}
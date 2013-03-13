package controllers.bean

import play.api.data.Form

import play.api._
import play.api.mvc._
import play.api.data._
import play.api.data.Forms._
import anorm.Pk

case class Greeting(name: String, repeat: Int, color: Option[String]) {
  var id: Long = 0
}
object GreetingForm {

  def create() =  {
    Form(mapping(
      "name" -> text
                .verifying("Must start with Hi", fields => fields match {
                  case (msg) => msg.startsWith("Hi")
                })
                .verifying("Must end with !", fields => fields match {
                  case (msg) => msg.endsWith("!")
                }),
      "repeat" -> number(min = 1, max = 100),
      "color" -> optional(text)
    )(Greeting.apply)(Greeting.unapply)
    )
  }
                              /*

      ((name, repeat, color) => Greeting(name=name, repeat=repeat, color=color))
      ((greeting) => Some(greeting.name)
                               */
}
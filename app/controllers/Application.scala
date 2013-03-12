package controllers

import bean.Greeting
import play.api._
import play.api.mvc._
import play.api.data._
import play.api.data.Forms._

import views._
import util.Random
import collection.mutable.ListBuffer

object Application extends Controller {

  /**
   * Describes the hello form.
   */
  val helloForm = Form(
    tuple(
      "name" -> nonEmptyText,
      "repeat" -> number(min = 1, max = 100),
      "color" -> optional(text)
    )
  )

  def index = Action {
    Ok(views.html.index(helloForm, "Your new application is ready."))
  }

  /**
   * Handles the form submission.
   */
  def sayHello = Action { implicit request =>
    helloForm.bindFromRequest.fold(
      formWithErrors => BadRequest(views.html.index(formWithErrors, "mmh pb interressant sur fold")),
      {case (name, repeat, color) => Ok(html.hello(name, repeat.toInt, color))}
    )
  }

  val greetings: ListBuffer[Greeting] = ListBuffer()

  def ajaxTest = Action { implicit request =>
    val g = new Greeting(name="Greeting" + greetings.length, Random.nextInt(5), Option.apply("red"))
    greetings += g
    Ok(views.html.greeting(greetings.toList))
  }
}
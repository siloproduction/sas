package controllers

import bean.{GreetingForm, Greeting}
import play.api.mvc._
import play.api.data._
import play.api.data.Forms._

import views._
import collection.mutable.ListBuffer
import play.api.templates.Html

object Application extends Controller {

  /**
   * Describes the hello form.
   */
  val helloForm = Form(
    "name" -> nonEmptyText
  )

  val greetingForm = GreetingForm.create()

  def createGreetingPanel: Html = {
    views.html.greeting(views.html.greetingForm(greetingForm), views.html.greetings(greetings.toList))
  }

  def index = Action {
    Ok(views.html.index(helloForm, createGreetingPanel, "Your new application is ready."))
  }

  /**
   * Handles the form submission.
   */
  def sayHello = Action { implicit request =>
    helloForm.bindFromRequest.fold(
    formWithErrors => BadRequest(views.html.index(formWithErrors, createGreetingPanel, "Erreur de formulaire")),
    {case (name) => Ok(html.hello(name))}
    )
  }

  val greetings: ListBuffer[Greeting] = ListBuffer()

  def createGreeting = Action { implicit request =>
  //val g = new Greeting(name="Greeting" + greetings.length, Random.nextInt(5), Option.apply("red"))
    val requestFrom: Form[Greeting] = greetingForm.bindFromRequest()
    val errors = requestFrom.globalErrors
    requestFrom.fold(
          formWithErrors => BadRequest(views.html.greetingForm(formWithErrors )),
        {case (greeting) => {
          greetings += greeting
          Ok(views.html.greetingForm(greetingForm))
        }}
    )
  }

  def getGreetings = Action { implicit request =>
    Ok(views.html.greetings(greetings.toList))
  }
}
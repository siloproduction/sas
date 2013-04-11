package controllers

import bean.{GreetingForm, Greeting}
import controllers.dao.{CategoryDao, GreetingDao}
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
    views.html.greeting(views.html.greetingForm(greetingForm), views.html.greetings(GreetingDao.findAll()))
  }

  def index = Action {
    Ok(views.html.index(helloForm, createGreetingPanel, CategoryDao.findAll()))
  }

  /**
   * Handles the form submission.
   */
  def sayHello = Action { implicit request =>
    helloForm.bindFromRequest.fold(
    formWithErrors => BadRequest(views.html.index(formWithErrors, createGreetingPanel, CategoryDao.findAll())),
    {case (name) => Ok(html.hello(name))}
    )
  }

  def createGreeting = Action { implicit request =>
    val requestFrom: Form[Greeting] = greetingForm.bindFromRequest()
    requestFrom.fold(
          formWithErrors => BadRequest(views.html.greetingForm(formWithErrors )),
        {case (greeting) => {
          GreetingDao.create(greeting)
          Ok(views.html.greetingForm(greetingForm))
        }}
    )
  }

  def getGreetings = Action { implicit request =>
    Ok(views.html.greetings(GreetingDao.findAll()))
  }
}
package controllers

import controllers.bean._
import controllers.dao.{UserDao, CategoryDao, GreetingDao}
import play.api.mvc._
import play.api.data._
import play.api.data.Forms._

import views._
import play.api.templates.Html
import controllers.bean.Greeting
import controllers.bean.Credentials

object Application extends Controller with Secured {

  /**
   * Describes the hello form.
   */
  val helloForm = Form(
    "name" -> nonEmptyText
  )

  val greetingForm = GreetingForm.create()
  val loginForm = LoginForm.create()

  def createGreetingPanel: Html = {
    views.html.greeting(views.html.greetingForm(greetingForm), views.html.greetings(GreetingDao.findAll()))
  }

  def index = Action { implicit request =>
    Ok(views.html.index(user, helloForm, createGreetingPanel, CategoryDao.findAll()))
  }

  def login = Action { implicit request =>
    Ok(views.html.login(user, loginForm))
  }

  def logout = Action {
    Redirect(routes.Application.index).withNewSession.flashing(
      "success" -> "You've been logged out"
    )
  }

  def authenticate = Action { implicit request =>
    val requestFrom: Form[Credentials] = loginForm.bindFromRequest()
    requestFrom.fold(
      formWithErrors => BadRequest(views.html.login(user, formWithErrors)),
      {case (credentials) => {
        try {
          val user = UserDao.login(credentials)
          Ok(views.html.index(Option.apply(user), helloForm, createGreetingPanel, CategoryDao.findAll()))
            .withSession(
              "user.profile" -> user.profile.toString,
              "user.login" -> user.login,
              "user.password" -> user.password)
        }
        catch{
          case x:UserNotFoundException => Results.Redirect(routes.Application.login)
          case x:InvalidCredentialsException => Results.Redirect(routes.Application.login)
        }
      }}
    )
  }

  /**
   * Handles the form submission.
   */
  def sayHello = Action { implicit request =>
    helloForm.bindFromRequest.fold(
    formWithErrors => BadRequest(views.html.index(user, formWithErrors, createGreetingPanel, CategoryDao.findAll())),
    {case (name) => Ok(html.hello(user, name))}
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
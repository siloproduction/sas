package controllers

import play.api.mvc.{Action, Controller}
import anorm.NotAssigned
import play.api.libs.json.Json
import play.api.libs.json._

import models.Event


object Application extends Controller {
  def index = Action {

    Ok(views.html.index())
  }

  def events = Action {
    val events: Seq[Event] = Event.findAll()

    Ok(views.html.events(events))
  }

  def event(id: Int) = Action {
    //val event: Option[Event] = Event.find(id)
    val eventWrites = Event.find(id)

    Ok(views.html.event(eventWrites))
  }

  def addEvent(name: String) = Action {
    Event.save(name)
    Redirect(routes.Application.events())
  }

}
  /*
  def index = Action { implicit request =>
    Ok("Hello world")
  }*/
  /*
    def login = Action { implicit request =>
      Ok(views.html.index(user))
    }

    def logout = Action {
      Redirect(routes.Application.index).withNewSession.flashing(
        "success" -> "You've been logged out"
      )
    }

    def authenticate = Action { implicit request =>
      val requestFrom: Form[Credentials] = loginForm.bindFromRequest()
      requestFrom.fold(
        formWithErrors => BadRequest(views.html.index(user)),
        {case (credentials) => {
          try {
            val user = UserDao.login(credentials)
            Ok(indexView(Option.apply(user)))
              .withSession(
                "user.id" -> user.id.toString,
                "user.profile" -> user.profile.toString,
                "user.email" -> user.email,
                "user.login" -> user.login)
          }
          catch{
            case x:UserNotFoundException => Results.Redirect(routes.Application.index)
            case x:InvalidCredentialsException => Results.Redirect(routes.Application.index)
          }
        }}
      )
    }*/

package controllers

import controllers.bean._
import controllers.dao.{PageDao, UserDao, CategoryDao}
import play.api.mvc._
import play.api.data._
import play.api.data.Forms._

import views._
import play.api.templates.Html
import controllers.bean.Credentials

object Application extends Controller with Secured {

  val loginForm = LoginForm.create()
  def indexView(user: Option[User]) = views.html.index(user, CategoryDao.findAll(), PageDao.findPageTop(), PageDao.findPageBottom())

  def index = Action { implicit request =>
    Ok(indexView(user))
  }

  def page(permanentLink: String) = Action { implicit request =>
    Ok(views.html.page(user, CategoryDao.findAll(), PageDao.findByPermanentLink(permanentLink)))
  }

  def login = Action { implicit request =>
    Ok(views.html.login(user, loginForm, CategoryDao.findAll()))
  }

  def logout = Action {
    Redirect(routes.Application.index).withNewSession.flashing(
      "success" -> "You've been logged out"
    )
  }

  def authenticate = Action { implicit request =>
    val requestFrom: Form[Credentials] = loginForm.bindFromRequest()
    requestFrom.fold(
      formWithErrors => BadRequest(views.html.login(user, formWithErrors, CategoryDao.findAll())),
      {case (credentials) => {
        try {
          val user = UserDao.login(credentials)
          Ok(indexView(Option.apply(user)))
            .withSession(
              "user.id" -> user.id.toString,
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
}
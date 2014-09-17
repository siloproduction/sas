package controllers

import controllers.bean._
import controllers.dao.{PageDao, UserDao, CategoryDao}
import play.api.mvc._
import play.api.data._
import play.api.data.Forms._

import views._
import play.api.templates.Html
import controllers.bean.Credentials
import play.api.libs.json.{JsObject, JsString, JsValue}

object Application extends Controller with Secured {

  val loginForm = LoginForm.create()
  def indexView(user: Option[User]) = views.html.index(user)

  def index = Action { implicit request =>
    Ok(indexView(user))
  }
  /*
  def contentIndex = Action { implicit request =>
    Ok(JsObject(Seq(
      "title" -> JsString("Anne Hengy - Conte"),
      "content" -> JsString(views.html.contentIndex.render(PageDao.findPageTop(), PageDao.findPageBottom()).body)
    )));
  }


  def page(permanentLink: String) = Action { implicit request =>
    try {
      val page = PageDao.findByPermanentLink(permanentLink)
      page.enabled match {
        case true => Ok(views.html.page(user, page))
        case false => TemporaryRedirect("/")
      }
    } catch {
      case e:Exception => BadRequest(views.html.page(user, Page.PAGE_NOT_FOUND))
    }
  }
  def contentPage(permanentLink: String) = Action { implicit request =>
    try {
      val page = PageDao.findByPermanentLink(permanentLink)
      page.enabled match {
        case true => Ok(JsObject(Seq(
                        "title" -> JsString(page.name),
                        "content" -> JsString(page.data)
                    )))
        case false => TemporaryRedirect("/")
      }
    } catch {
      case e:Exception => BadRequest(views.html.page(user, Page.PAGE_NOT_FOUND))
    }
  }*/

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
  }
}
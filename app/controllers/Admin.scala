package controllers

import bean.{UserForm, User}
import dao.UserDao
import play.api.mvc._
import play.api.data._

import play.api.templates.Html

object Admin extends Controller {

  val userForm = UserForm.create()

  def createUserPanel: Html = {
    views.html.admin.user(views.html.admin.userForm(userForm), views.html.admin.users(UserDao.findAll()))
  }

  def index = Action {
    Ok(views.html.admin.index(createUserPanel))
  }

  def createUser = Action { implicit request =>
    val requestFrom: Form[User] = userForm.bindFromRequest()
    requestFrom.fold(
          formWithErrors => BadRequest(views.html.admin.userForm(formWithErrors )),
        {case (user) => {
          UserDao.create(user)
          Ok(views.html.admin.userForm(userForm))
        }}
    )
  }

  def getUsers = Action { implicit request =>
    Ok(views.html.admin.users(UserDao.findAll()))
  }
}
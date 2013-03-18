package controllers

import controllers.bean.{CategoryForm, Category, UserForm, User}
import controllers.dao.{CategoryDao, UserDao}
import play.api.mvc._
import play.api.data._

import play.api.templates.Html

object Admin extends Controller {

  val userForm = UserForm.create()
  val categoryForm = CategoryForm.create()

  def createUserPanel: Html = {
    views.html.admin.user(views.html.admin.userForm(userForm), views.html.admin.users(UserDao.findAll()))
  }
  def createCategoryPanel: Html = {
    views.html.admin.category.category(
        categoryForm = views.html.admin.category.categoryForm(categoryForm, CategoryDao.findAll()),
        categories = views.html.admin.category.categories(CategoryDao.findAll()))
  }

  def index = Action {
    Ok(views.html.admin.index(createUserPanel,createCategoryPanel))
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

  def createCategory = Action { implicit request =>
    val requestFrom: Form[Category] = categoryForm.bindFromRequest()
    requestFrom.fold(
      formWithErrors => BadRequest(views.html.admin.category.categoryForm(formWithErrors, CategoryDao.findAll())),
      {case (category) => {
        CategoryDao.create(category)
        Ok(views.html.admin.category.categoryForm(categoryForm, CategoryDao.findAll()))
      }}
    )
  }

  def getUsers = Action { implicit request =>
    Ok(views.html.admin.users(UserDao.findAll()))
  }

  def getCategories = Action { implicit request =>
    Ok(views.html.admin.category.categories(CategoryDao.findAll()))
  }
}
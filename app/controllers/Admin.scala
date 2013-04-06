package controllers

import controllers.bean._
import controllers.dao.{PageDao, CategoryDao, UserDao}
import play.api.mvc._
import play.api.data._

import play.api.templates.Html
import controllers.bean.User
import controllers.bean.Category
import play.templates.TemplateMagic.anyToDefault

object Admin extends Controller {

  val userForm = UserForm.create()
  val categoryForm = CategoryForm.create()
  val pageForm = PageForm.create()

  def createUserPanel: Html = {
    views.html.admin.user(views.html.admin.userForm(userForm), views.html.admin.users(UserDao.findAll()))
  }
  def createCategoryPanel: Html = {
    views.html.admin.category.category(
        categoryForm = views.html.admin.category.categoryForm(categoryForm, CategoryDao.findAll()),
        categories = views.html.admin.category.categories(CategoryDao.findAll()))
  }
  def createPagePanel: Html = {
    views.html.admin.page.page(
      pageForm = views.html.admin.page.pageForm(pageForm, CategoryDao.findAll()),
      pages = views.html.admin.page.pages(PageDao.findAll())
    )
  }

  def index = Action {
    Ok(views.html.admin.index(createUserPanel,createCategoryPanel, createPagePanel))
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

  def createPage = Action { implicit request =>
    val requestForm: Form[Page] = pageForm.bindFromRequest()
    requestForm.fold(
      formWithErrors => BadRequest(views.html.admin.page.pageForm(formWithErrors, CategoryDao.findAll())),
      {case (page) =>
        PageDao.create(page)
        Ok(views.html.admin.page.pageForm(pageForm, CategoryDao.findAll()))
      }
    )

  }

  def getUsers = Action { implicit request =>
    Ok(views.html.admin.users(UserDao.findAll()))
  }

  def getCategories = Action { implicit request =>
    Ok(views.html.admin.category.categories(CategoryDao.findAll()))
  }

  def getPages = Action { implicit request =>
    Ok(views.html.admin.page.pages(PageDao.findAll()))
  }
}
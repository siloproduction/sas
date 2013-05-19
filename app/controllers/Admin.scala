package controllers

import controllers.bean._
import controllers.dao.{PageDao, CategoryDao, UserDao}
import play.api.mvc._
import play.api.data._

import play.api.templates.Html
import controllers.bean.User
import controllers.bean.Category
import play.templates.TemplateMagic.anyToDefault

object Admin extends Controller with Secured {

  val userForm = UserForm.create()
  val categoryForm = CategoryForm.create()
  val pageForm = PageForm.create()

  def createUserPanel: Html = {
    views.html.admin.user.user(views.html.admin.user.userForm(userForm, Option.empty), views.html.admin.user.users(UserDao.findAll()))
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

  def index = IsAdmin { username => implicit request =>
    Ok(views.html.admin.index(user, createUserPanel,createCategoryPanel, createPagePanel, CategoryDao.findAll()))
  }

  def createUser = IsAdmin { username => implicit request =>
    val requestFrom: Form[User] = userForm.bindFromRequest()
    requestFrom.fold(
      formWithErrors => BadRequest(views.html.admin.user.userForm(formWithErrors, Option.empty)),
      {case (user) => {
        UserDao.create(user)
        Ok(views.html.admin.user.userForm(userForm, Option.empty))
      }}
    )
  }
  def updateUser(login: String) = IsAdmin { username => implicit request =>
    val requestFrom: Form[User] = userForm.bindFromRequest()
    requestFrom.fold(
      formWithErrors => BadRequest(views.html.admin.user.userForm(formWithErrors, Option.apply(UserDao.findByLogin(login)))),
      {case (user) => {
        UserDao.update(login, user)
        Ok(views.html.admin.user.userForm(userForm, Option.apply(user)))
      }}
    )
  }

  def createCategory = IsAdmin { username => implicit request =>
    val requestFrom: Form[Category] = categoryForm.bindFromRequest()
    requestFrom.fold(
      formWithErrors => BadRequest(views.html.admin.category.categoryForm(formWithErrors, CategoryDao.findAll())),
      {case (category) => {
        CategoryDao.create(category)
        Ok(views.html.admin.category.categoryForm(categoryForm, CategoryDao.findAll()))
      }}
    )
  }
  def updateCategory(id: String) = IsAdmin { username => implicit request =>
    val requestFrom: Form[Category] = categoryForm.bindFromRequest()
    requestFrom.fold(
      formWithErrors => BadRequest(views.html.admin.category.categoryForm(formWithErrors, CategoryDao.findAll())),
      {case (category) => {
        CategoryDao.create(category)
        Ok(views.html.admin.category.categoryForm(categoryForm, CategoryDao.findAll()))
      }}
    )
  }

  def createPage = IsAdmin { username => implicit request =>
    val requestForm: Form[Page] = pageForm.bindFromRequest()
    requestForm.fold(
      formWithErrors => BadRequest(views.html.admin.page.pageForm(formWithErrors, CategoryDao.findAll())),
      {case (page) =>
        PageDao.create(page)
        Ok(views.html.admin.page.pageForm(pageForm, CategoryDao.findAll()))
      }
    )

  }
  def updatePage(permanentLink: String) = IsAdmin { username => implicit request =>
    val requestForm: Form[Page] = pageForm.bindFromRequest()
    requestForm.fold(
      formWithErrors => BadRequest(views.html.admin.page.pageForm(formWithErrors, CategoryDao.findAll())),
      {case (page) =>
        PageDao.create(page)
        Ok(views.html.admin.page.pageForm(pageForm, CategoryDao.findAll()))
      }
    )

  }

  def getUsers = IsAdmin { username => implicit request =>
    Ok(views.html.admin.user.users(UserDao.findAll()))
  }

  def getCategories = IsAdmin { username => implicit request =>
    Ok(views.html.admin.category.categories(CategoryDao.findAll()))
  }

  def getPages = IsAdmin { username => implicit request =>
    Ok(views.html.admin.page.pages(PageDao.findAll()))
  }
}
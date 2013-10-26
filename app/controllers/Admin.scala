package controllers

import controllers.bean._
import controllers.dao.{DAOException, PageDao, CategoryDao, UserDao}
import play.api.mvc._
import play.api.data._

import play.api.templates.Html
import controllers.bean.User
import controllers.bean.Category

object Admin extends Controller with Secured {

  val userBindingForm = UserForm.create()
  val categoryForm = CategoryForm.create()
  val pageForm = PageForm.create()

  def createUserPanel: Html = {
    views.html.admin.entityPanel(
      entityCreateForm = views.html.admin.user.userCreateForm(UserForm.create()),
      initialEntities = views.html.admin.user.users(UserDao.findAll()))
  }
  def createCategoryPanel: Html = {
    views.html.admin.entityPanel(
      entityCreateForm = views.html.admin.category.categoryCreateForm(CategoryForm.create()),
      initialEntities = views.html.admin.category.categories(CategoryDao.findAll()))
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
    val requestForm: Form[User] = userBindingForm.bindFromRequest()
    requestForm.fold(
      formWithErrors => BadRequest(views.html.admin.user.userCreateForm(formWithErrors)),
      {case (user) => {
        try {
          UserDao.create(user)
          Ok(views.html.admin.user.userCreateForm(UserForm.create()))
        } catch {
          case e: Exception => {
            InternalServerError(e.getMessage)
          }
        }
      }}
    )
  }
  def updateUser(login: String) = IsAdmin { username => implicit request =>
    val requestForm: Form[User] = userBindingForm.bindFromRequest()
    requestForm.fold(
      formWithErrors => {
        val entityId = requestForm.data("entityId")
        BadRequest(views.html.admin.user.userUpdateForm(formWithErrors, entityId))
      },
      {case (user) => {
        UserDao.update(login, user)
        Ok(views.html.admin.user.userUpdateForm(requestForm, user.login))
      }}
    )
  }
  def deleteUser(login: String) = IsAdmin { username => implicit request =>
    try {
      UserDao.delete(login) match {
        case 0 => NotFound("No user has been removed")
        case _ => Ok("Success")
      }
    } catch {
      case e: Exception => {
        InternalServerError(e.getMessage)
      }
    }
  }

  def createCategory = IsAdmin { username => implicit request =>
    val requestFrom: Form[Category] = categoryForm.bindFromRequest()
    requestFrom.fold(
      formWithErrors => BadRequest(views.html.admin.category.categoryCreateForm(formWithErrors)),
      {case (category) => {
        CategoryDao.create(category)
        Ok(views.html.admin.category.categoryCreateForm(CategoryForm.create()))
      }}
    )
  }
  def updateCategory(id: Long) = IsAdmin { username => implicit request =>
    val requestForm: Form[Category] = categoryForm.bindFromRequest()
    requestForm.fold(
      formWithErrors => {
        BadRequest(views.html.admin.category.categoryUpdateForm(formWithErrors, id))
      },
      {case (category) => {
        CategoryDao.update(category)
        Ok(views.html.admin.category.categoryUpdateForm(requestForm, category.id))
      }}
    )
  }
  def deleteCategory(id: Long) = IsAdmin { username => implicit request =>
    try {
      CategoryDao.delete(id) match {
        case 0 => NotFound("No category has been removed")
        case _ => Ok("Success")
      }
    } catch {
      case e: Exception => {
        InternalServerError(e.getMessage)
      }
    }
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
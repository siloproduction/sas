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
  val categoryBindingForm = CategoryForm.create()
  val pageForm = PageForm.create()

  def createUserPanel: Html = views.html.admin.user.userPanel(UserForm.create())
  def createCategoryPanel: Html = views.html.admin.category.categoryPanel(CategoryForm.create())

  def createPagePanel: Html = {
    views.html.admin.page.page(
      pageForm = views.html.admin.page.pageForm(pageForm, CategoryDao.findAll()),
      pages = views.html.admin.page.pages(PageDao.findAll())
    )
  }

  def index = IsAdmin { username => implicit request =>
    Ok(views.html.admin.index(user, createUserPanel,createCategoryPanel, createPagePanel, CategoryDao.findAll()))
  }

  def getUpdateUserForm(id: Long) = IsAdmin { username => implicit request =>
    val user = UserDao.findById(id)
    Ok(views.html.admin.user.userForm(user.id, User.asUpdateFormId(id), UserForm.update(user)))
  }

  def getUpdateCategoryForm(id: Long) = IsAdmin { username => implicit request =>
    val category = CategoryDao.findById(id)
    Ok(views.html.admin.category.categoryForm(category.id, Category.asUpdateFormId(id), CategoryForm.update(category)))
  }


  def createUser = IsAdmin { username => implicit request =>
    val requestForm: Form[User] = userBindingForm.bindFromRequest()
    requestForm.fold(
      formWithErrors => BadRequest(views.html.admin.user.userForm(0, User.asCreateFormId, formWithErrors)),
      {case (user) => {
        try {
          UserDao.create(user)
          Ok(views.html.admin.user.userForm(0, User.asCreateFormId, UserForm.create))
        } catch {
          case e: Exception => {
            InternalServerError(e.getMessage)
          }
        }
      }}
    )
  }
  def updateUser(id: Long) = IsAdmin { username => implicit request =>
    val requestForm: Form[User] = userBindingForm.bindFromRequest()
    requestForm.fold(
      formWithErrors => {
        val userId = requestForm.data("id").toLong
        BadRequest(views.html.admin.user.userForm(userId, User.asUpdateFormId(id), formWithErrors))
      },
      {case (user) => {
        UserDao.update(user)
        Ok(views.html.admin.user.userForm(user.id, User.asUpdateFormId(id), requestForm))
      }}
    )
  }
  def deleteUser(id: Long) = IsAdmin { username => implicit request =>
    try {
      UserDao.delete(id) match {
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
    val requestFrom: Form[Category] = categoryBindingForm.bindFromRequest()
    requestFrom.fold(
      formWithErrors => BadRequest(views.html.admin.category.categoryForm(0, Category.asCreateFormId, formWithErrors)),
      {case (category) => {
        try {
          CategoryDao.create(category)
          Ok(views.html.admin.category.categoryForm(0, Category.asCreateFormId, CategoryForm.create()))
        } catch {
          case e: Exception => {
            InternalServerError(e.getMessage)
          }
        }
      }}
    )
  }
  def updateCategory(id: Long) = IsAdmin { username => implicit request =>
    val requestForm: Form[Category] = categoryBindingForm.bindFromRequest()
    requestForm.fold(
      formWithErrors => {
        val categoryId = requestForm.data("id").toLong
        BadRequest(views.html.admin.category.categoryForm(categoryId, Category.asUpdateFormId(id), formWithErrors))
      },
      {case (category) => {
        CategoryDao.update(category)
        Ok(views.html.admin.category.categoryForm(category.id, Category.asUpdateFormId(id), requestForm))
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
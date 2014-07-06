package controllers

import controllers.bean._
import controllers.dao.{DAOException, PageDao, CategoryDao, UserDao}
import json.JsonWriters._
import play.api.mvc._
import play.api.data._

import play.api.templates.Html
import controllers.bean.User
import controllers.bean.Category
import play.api.libs.json.Json

object Admin extends Controller with Secured {

  val userBindingForm = UserForm.create()
  val userUpdateBindingForm = UserForm.update()
  val categoryBindingForm = CategoryForm.create()
  val pageBindingForm = PageForm.create()

  def createUserPanel: Html = views.html.admin.user.userPanel()
  def createCategoryPanel: Html = views.html.admin.category.categoryPanel()
  def createPagePanel: Html = views.html.admin.page.pagePanel()

  def index = IsAdmin { username => implicit request =>
    Ok(views.html.admin.index(user, createUserPanel,createCategoryPanel, createPagePanel))
  }

  def getUsers = IsAdmin { username => implicit request =>
    Ok(Json.toJson(UserDao.findAll()))
  }

  def getCategories = IsAdmin { username => implicit request =>
    Ok(Json.toJson(CategoryDao.findAll()))
  }

  def getPages = IsAdmin { username => implicit request =>
    Ok(Json.toJson(PageDao.findAll()))
  }


  def createUser = IsAdmin { username => implicit request =>
    try {
      userBindingForm.bindFromRequest().fold(
        formWithErrors => BadRequest(formWithErrors.errorsAsJson),
        user => {
          val userId = UserDao.create(user)
          Ok(Json.toJson(UserDao.findById(userId)))
        }
      )
    } catch {
      case e: Exception => {
        InternalServerError(e.getMessage)
      }
    }
  }

  def updateUser(id: Long) = IsAdmin { username => implicit request =>
    try {
      userUpdateBindingForm.bindFromRequest().fold(
        formWithErrors => BadRequest(formWithErrors.errorsAsJson),
        user => {
          UserDao.update(user)
          NoContent
        }
      )
    } catch {
      case e: Exception => {
        InternalServerError(e.getMessage)
      }
    }
  }

  def deleteUser(id: Long) = IsAdmin { username => implicit request =>
    try {
      UserDao.delete(id) match {
        case 0 => NotFound("No user has been removed")
        case _ => NoContent
      }
    } catch {
      case e: Exception => {
        InternalServerError(e.getMessage)
      }
    }
  }



  def createCategory = IsAdmin { username => implicit request =>
    try {
      categoryBindingForm.bindFromRequest().fold(
        formWithErrors => BadRequest(formWithErrors.errorsAsJson),
        category => {
          val categoryId = CategoryDao.create(category)
          Ok(Json.toJson(CategoryDao.findById(categoryId)))
        }
      )
    } catch {
      case e: Exception => {
        InternalServerError(e.getMessage)
      }
    }
  }
  def updateCategory(id: Long) = IsAdmin { username => implicit request =>
    try {
      categoryBindingForm.bindFromRequest().fold(
        formWithErrors => BadRequest(formWithErrors.errorsAsJson),
        category => {
          CategoryDao.update(category)
          NoContent
        }
      )
    } catch {
      case e: Exception => {
        InternalServerError(e.getMessage)
      }
    }
  }
  def deleteCategory(id: Long) = IsAdmin { username => implicit request =>
    try {
      CategoryDao.delete(id) match {
        case 0 => NotFound("No category has been removed")
        case _ => NoContent
      }
    } catch {
      case e: Exception => {
        InternalServerError(e.getMessage)
      }
    }
  }


  def createPage = IsAdmin { username => implicit request =>
    try {
      pageBindingForm.bindFromRequest().fold(
        formWithErrors => BadRequest(formWithErrors.errorsAsJson),
        page => {
          val pageId = PageDao.create(page)
          Ok(Json.toJson(PageDao.findById(pageId)))
        }
      )
    } catch {
      case e: Exception => {
        InternalServerError(e.getMessage)
      }
    }
  }
  def updatePage(id: Long) = IsAdmin { username => implicit request =>
    try {
      pageBindingForm.bindFromRequest().fold(
        formWithErrors => BadRequest(formWithErrors.errorsAsJson),
        page => {
          PageDao.update(page)
          NoContent
        }
      )
    } catch {
      case e: Exception => {
        InternalServerError(e.getMessage)
      }
    }
  }
  def deletePage(id: Long) = IsAdmin { username => implicit request =>
    try {
      PageDao.delete(id) match {
        case 0 => NotFound("No page has been removed")
        case _ => NoContent
      }
    } catch {
      case e: Exception => {
        InternalServerError(e.getMessage)
      }
    }
  }
}
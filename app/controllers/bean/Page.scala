package controllers.bean

import UserProfile.UserProfile

import play.api.data._
import play.api.data.Forms._
import controllers.dao.CategoryDao
import views.html.admin.category.category

case class Page(
       name: String,
       category: Category,
       permanentLink: String,
       data: String,
       rank: Int,
       enabled: Boolean)
object PageForm {

  def create() =  {
    Form(mapping(
      "name" -> text
                .verifying("3 characters minimum", fields => fields match {
                  case (name) => name.size > 2
                }),
      "category" -> text
                .verifying("Must match an existing category", fields => fields match {
                  case (category) => !Category.isRootCategory(category) && CategoryDao.isValidParent(Option.apply(category))
                }),
      "permanentLink" -> text
                .verifying("No space allowed", fields => fields match {
                  case (permanentLink) => !permanentLink.isEmpty && !permanentLink.contains(" ")
                }),
      "data" -> nonEmptyText,
      "rank" -> number,
      "enabled" -> boolean
    )((name, category, permanentLink, data, rank, enabled) => Page(name, CategoryDao.findByName(category), permanentLink, data, rank, enabled))
     ((page) => Some(page.name, page.category.name, page.permanentLink, page.data, page.rank, page.enabled))
    )
  }
}
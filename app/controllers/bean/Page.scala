package controllers.bean

import play.api.data._
import play.api.data.Forms._
import controllers.dao.CategoryDao

case class Page(
       name: String,
       category: Option[Category],
       permanentLink: String,
       data: String,
       rank: Int,
       enabled: Boolean) {
  var id: Long = 0
}
object PageForm {

  def create() =  {
    Form(mapping(
      "name" -> text
                .verifying("3 characters minimum", fields => fields match {
                  case (name) => name.size > 2
                }),
      "category" -> optional(longNumber)
                .verifying("Must match an existing category", fields => fields match {
                  case (categoryId) => categoryId.isDefined && CategoryDao.isValidParent(categoryId.get)
                }),
      "permanentLink" -> text
                .verifying("No space allowed", fields => fields match {
                  case (permanentLink) => !permanentLink.isEmpty && !permanentLink.contains(" ")
                }),
      "data" -> nonEmptyText,
      "rank" -> number,
      "enabled" -> boolean
    )((name, category, permanentLink, data, rank, enabled) => {
        Page(name, CategoryDao.findByIdOption(category), permanentLink, data, rank, enabled)
    })
     ((page) => Some(page.name, page.category.map(_.id), page.permanentLink, page.data, page.rank, page.enabled))
    )
  }
}
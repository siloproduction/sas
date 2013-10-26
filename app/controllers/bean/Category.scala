package controllers.bean

import UserProfile.UserProfile

import play.api.data._
import play.api.data.Forms._
import controllers.dao.{PageDao, CategoryDao}

case class Category(name: String, parent: Category, link: Option[String], rank: Int, enabled: Boolean) {
  var id: Long = 0
  lazy val pages = PageDao.findByCategoryId(id)
}
object Category {

  def noCategory = Category("no category", null, Option.empty, 0, false)

  def asUpdateFormId(category: Category): String = asUpdateFormId(category.id)
  def asUpdateFormId(id: Long) = "admin-update-category-" + id
  def asCreateFormId(): String = "admin-create-category"
}
object CategoryForm {

  def update(category: Category): Form[Category] =  create().fill(category)

  def create() =  {
    Form(mapping(
      "name" -> text
                .verifying("3 characters minimum", fields => fields match {
                  case (name) => name.size > 2
                }),
      "parent" -> longNumber
                .verifying("Must match an existing category", fields => fields match {
                  case (parentId) => CategoryDao.isValidParent(parentId)
                }),
      "link" -> optional(text)
                .verifying("Must start with http://", fields => fields match {
                  case (link) => link.getOrElse("http://").startsWith("http://")
                }),
      "rank" -> number,
      "enabled" -> boolean
    )((name, parent, link, rank, enabled) => Category(name, CategoryDao.findById(parent), link, rank, enabled))
     ((category) => Some(category.name, category.parent.id, category.link, category.rank, category.enabled))
    )
  }
}
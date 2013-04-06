package controllers.bean

import UserProfile.UserProfile

import play.api.data._
import play.api.data.Forms._
import controllers.dao.CategoryDao

case class Category(name: String, parent: String, link: Option[String], rank: Int, enabled: Boolean)
object Category {

  def isRootCategory(categoryName: String):Boolean = categoryName.equals("")

}
object CategoryForm {

  def create() =  {
    Form(mapping(
      "name" -> text
                .verifying("3 characters minimum", fields => fields match {
                  case (name) => name.size > 2
                }),
      "parent" -> optional(text)
                .verifying("Must match an existing category", fields => fields match {
                  case (parent) => CategoryDao.isValidParent(parent)
                }),
      "link" -> optional(text)
                .verifying("Must start with http://", fields => fields match {
                  case (link) => link.getOrElse("http://").startsWith("http://")
                }),
      "rank" -> number,
      "enabled" -> boolean
    )((name, parent, link, rank, enabled) => Category(name, parent.getOrElse(""), link, rank, enabled))
     ((category) => Some(category.name, Option.apply(category.parent), category.link, category.rank, category.enabled))
    )
  }
}
package controllers.bean

import UserProfile.UserProfile

import play.api.data._
import play.api.data.Forms._
import controllers.dao.CategoryDao

case class Category(name: String, parent: String, rank: Int, enabled: Boolean)
object CategoryForm {

  def create() =  {
    Form(mapping(
      "name" -> text
                .verifying("3 characters minimum", fields => fields match {
                  case (name) => name.size > 2
                }),
      "parent" -> optional(text)
                .verifying("Must match an existing category", fields => fields match {
                  case (parent) => isValidParent(parent)
                }),
      "rank" -> number,
      "enabled" -> boolean
    )((name, parent, rank, enabled) => Category(name, parent.getOrElse("" ), rank, enabled))
     ((category) => Some(category.name, Option.apply(category.parent), category.rank, category.enabled))
    )
  }

  def isValidParent(parent: Option[String]):Boolean = {
    CategoryDao.findAll().exists(_.name == parent.getOrElse(""))
  }
}
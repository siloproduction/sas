package controllers.bean

import UserProfile.UserProfile

import play.api.data._
import play.api.data.Forms._
import controllers.dao.{PageDao, CategoryDao}

case class Category(id: Long, name: String, parent: Option[Category], link: Option[String] = Option.empty, rank: Int = 1, enabled: Boolean) {
  def pages() = PageDao.findByCategoryId(id)
  def subCategories() = CategoryDao.findChildrenOf(id)

  def hasNoneParent = parent.isEmpty || parent.equals(Category.noCategory)
  def hasParentLoop() = parent.isDefined && id == parent.get.id // MUST LOOP ON ITS PARENT TOO
  def canBePersisted = !hasParentLoop() && id != Category.NONE_ID
}
object Category {

  def noCategory = Category(id = NONE_ID, name = NONE_NAME, parent = None, enabled = false)

  def asUpdateFormId(category: Category): String = asUpdateFormId(category.id)
  def asUpdateFormId(id: Long) = "admin-update-category-" + id
  val asCreateFormId = "admin-create-category"

  val NONE_ID = 0
  val NONE_NAME = "None"
}
object CategoryForm {

  def update(category: Category): Form[Category] =  create().fill(category)

  def create() =  {
    Form(mapping(
      "id" -> longNumber,
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
    )
     ((id, name, parent, link, rank, enabled) => Category(id, name, Some(CategoryDao.findById(parent)), link, rank, enabled))
     ((category) => Some(category.id, category.name, category.parent match {
       case Some(parent) => parent.id
       case _ => -1
     }, category.link, category.rank, category.enabled))
      verifying("The parent cannot be itself", _.canBePersisted)
    )
  }
}
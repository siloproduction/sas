package controllers.bean

import play.api.data._
import play.api.data.Forms._
import controllers.dao.CategoryDao

case class Page(
       id: Long = 0,
       name: String,
       category: Category = Category.noCategory,
       permanentLink: String,
       data: String,
       rank: Int,
       enabled: Boolean)

object Page {

  def asUpdateFormId(page: Page): String = asUpdateFormId(page.id)
  def asUpdateFormId(id: Long) = "admin-update-page-" + id
  val asCreateFormId = "admin-create-page"

  val PAGE_NOT_FOUND = Page(
    name = "Page not found",
    category = Category.noCategory,
    permanentLink = "404",
    data = "404 - Oops this page cannot be found!",
    rank = 0,
    enabled = true
  )
}

object PageForm {

  def update(page: Page): Form[Page] =  create().fill(page)

  def create() =  {
    Form(mapping(
      "id" -> longNumber,
      "name" -> text
                .verifying("3 characters minimum", fields => fields match {
                  case (name) => name.size > 2
                }),
      "category" -> longNumber
                .verifying("Must match an existing category", fields => fields match {
                  case (categoryId) => CategoryDao.isValidParent(categoryId)
                }),
      "permanentLink" -> text
                .verifying("No space allowed", fields => fields match {
                  case (permanentLink) => !permanentLink.isEmpty && !permanentLink.contains(" ")
                }),
      "data" -> nonEmptyText,
      "rank" -> number,
      "enabled" -> boolean
    )((id, name, category, permanentLink, data, rank, enabled) => {
        Page(id, name, CategoryDao.findById(category), permanentLink, data, rank, enabled)
    })
     ((page) => Some(page.id, page.name, page.category.id, page.permanentLink, page.data, page.rank, page.enabled))
    )
  }
}
package controllers.dao

import play.api.db._
import play.api.Play.current

import anorm._
import anorm.SqlParser._
import controllers.bean.{Greeting, Page, Category}

/**
 * @Author("bltCrew")
 */
object PageDao {

  val parser = {
    get[Pk[String]]("name") ~
    get[Pk[String]]("category") ~
    get[String]("permanentLink") ~
    get[String]("data") ~
    get[Int]("rank") ~
    get[Boolean]("enabled") map {
      case name~category~permanentLink~data~rank~enabled =>
        Page(name.get, CategoryDao.findByName(category.get), permanentLink, data, rank, enabled)
    }
  }

  def findAll(): Seq[Page] = {
    DB.withConnection { implicit connection =>
      SQL("select * from page").as(parser *)
    }
  }

  def create(page: Page): Unit = {
    DB.withConnection { implicit connection =>
      SQL("insert into page(name, category, permanentLink, data, rank, enabled)" +
        " values ({name}, {category}, {permanentLink}, {data}, {rank}, {enabled})").on(
        'name -> page.name,
        'category -> page.category.name,
        'permanentLink -> page.permanentLink,
        'data -> page.data,
        'rank -> page.rank,
        'enabled -> page.enabled
      ).executeUpdate()
    }
  }

  def findByCategory(categoryName: String): Seq[Page] = {
    DB.withConnection { implicit  connection =>
      SQL("select * from page where category={category}").on(
        'category -> categoryName
      ).as(parser *)
    }
  }
}

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
    get[Pk[Long]]("id") ~
    get[String]("name") ~
    get[Option[Long]]("categoryId") ~
    get[String]("permanentLink") ~
    get[String]("data") ~
    get[Int]("rank") ~
    get[Boolean]("enabled") map {
      case id~name~categoryId~permanentLink~data~rank~enabled =>  {
        val bean = Page(name, CategoryDao.findByIdOption(categoryId), permanentLink, data, rank, enabled)
        bean.id = id.get
        bean
      }
    }
  }

  def findAll(): Seq[Page] = {
    DB.withConnection { implicit connection =>
      SQL("select * from page").as(parser *)
    }
  }

  def create(page: Page): Unit = {
    DB.withConnection { implicit connection =>
      SQL("insert into page(name, categoryId, permanentLink, data, rank, enabled)" +
        " values ({name}, {categoryId}, {permanentLink}, {data}, {rank}, {enabled})").on(
        'name -> page.name,
        'categoryId -> page.category.map(_.id),
        'permanentLink -> page.permanentLink,
        'data -> page.data,
        'rank -> page.rank,
        'enabled -> page.enabled
      ).executeUpdate()
    }
  }

  def findByCategoryId(categoryId: Long): Seq[Page] = {
    DB.withConnection { implicit  connection =>
      SQL("select * from page where categoryId={categoryId}").on(
        'categoryId -> categoryId
      ).as(parser *)
    }
  }

  def findByPermanentLink(permanentLink: String): Page = {
    DB.withConnection { implicit  connection =>
      SQL("select * from page where permanentLink={permanentLink}").on(
        'permanentLink -> permanentLink
      ).as(parser *).head
    }
  }
}

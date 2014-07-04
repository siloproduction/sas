package controllers.dao

import play.api.db._
import play.api.Play.current

import anorm._
import anorm.SqlParser._
import controllers.bean.{Page, Category}

/**
 * @Author("bltCrew")
 */
object PageDao {

  val PAGE_BOTTOM = "accueil_news"
  val PAGE_TOP = "accueil_presentation"

  val parser = {
    get[Pk[Long]]("id") ~
    get[String]("name") ~
    get[Long]("categoryId") ~
    get[String]("permanentLink") ~
    get[String]("data") ~
    get[Int]("rank") ~
    get[Boolean]("enabled") map {
      case id~name~categoryId~permanentLink~data~rank~enabled => Page(id.get, name, CategoryDao.findById(categoryId), permanentLink, data, rank, enabled)
    }
  }

  def findAll(): Seq[Page] = {
    DB.withConnection { implicit connection =>
      SQL("select * from page order by name asc").as(parser *)
    }
  }

  def create(page: Page): Long = {
    try {
      DB.withConnection { implicit connection =>
        SQL("insert into page(name, categoryId, permanentLink, data, rank, enabled)" +
          " values ({name}, {categoryId}, {permanentLink}, {data}, {rank}, {enabled})").on(
          'name -> page.name,
          'categoryId -> page.category.id,
          'permanentLink -> page.permanentLink,
          'data -> page.data,
          'rank -> page.rank,
          'enabled -> page.enabled
        ).executeInsert().get
      }
    } catch {
      case e: Exception => throw new DAOException("Cannot create page: " + e.getMessage)
    }
  }

  def update(page: Page): Unit = {
    DB.withConnection { implicit connection =>
      SQL("UPDATE page SET name={name}, categoryId={categoryId}, permanentLink={permanentLink}, data={data}, rank={rank}, enabled={enabled}" +
        " WHERE page.id={id}").on(
        'id -> page.id,
        'name -> page.name,
        'categoryId-> page.category.id,
        'permanentLink -> page.permanentLink,
        'data -> page.data,
        'rank -> page.rank,
        'enabled -> page.enabled
      ).executeUpdate()
    }
  }

  def findByCategoryId(categoryId: Long): Seq[Page] = {
    DB.withConnection { implicit  connection =>
      SQL("select * from page where categoryId={categoryId} order by rank asc").on(
        'categoryId -> categoryId
      ).as(parser *)
    }
  }

  def findByPermanentLink(permanentLink: String): Page = {
    DB.withConnection { implicit  connection =>
      SQL("select * from page where permanentLink={permanentLink} order by rank asc").on(
        'permanentLink -> permanentLink
      ).as(parser *).head
    }
  }

  def findById(id: Long): Page = {
    DB.withConnection { implicit  connection =>
      SQL("select * from page where id={id}").on(
        'id -> id
      ).as(parser *).head
    }
  }

  def delete(pageId: Long): Int = {
    DB.withConnection { implicit connection =>
      SQL("DELETE FROM page WHERE id={id}").on(
        'id -> pageId
      ).executeUpdate()
    }
  }

  def findPageTop()= findByPermanentLink(PAGE_TOP)
  def findPageBottom()= findByPermanentLink(PAGE_BOTTOM)
}

package controllers.dao

import play.api.db._
import play.api.Play.current

import anorm._
import anorm.SqlParser._
import controllers.bean.{Category, UserProfile, User}

/**
 * @Author("bltCrew")
 */
object CategoryDao {

  val parser = {
    get[Pk[String]]("name") ~
    get[Pk[String]]("parent") ~
    get[Option[String]]("link") ~
    get[Int]("rank") ~
    get[Boolean]("enabled") map {
      case name~parent~link~rank~enabled => Category(name.get, parent.getOrElse(""), link, rank, enabled)
    }
  }

  def findAll(): Seq[Category] = {
    DB.withConnection { implicit connection =>
      SQL("select * from category").as(parser *)
    }
  }

  def create(category: Category): Unit = {
    DB.withConnection { implicit connection =>
      SQL("insert into category(name, parent, link, rank, enabled) values ({name}, {parent}, {link}, {rank}, {enabled})").on(
        'name -> category.name,
        'parent -> category.parent,
        'link -> category.link,
        'rank -> category.rank,
        'enabled -> category.enabled
      ).executeUpdate()
    }
  }

  def isValidParent(parent: Option[String]):Boolean = {
    DB.withConnection { implicit connection =>
      SQL("select 1 from category where name={name}").on(
        'name -> parent.getOrElse("")
      ).execute()
    }
  }

  def findByName(name: String): Category = {
    DB.withConnection { implicit connection =>
      SQL("select * from category where name={name}").on(
        'name -> name
      ).as(parser *)
       .head
    }
  }
}

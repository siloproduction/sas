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
    get[Int]("rank") ~
    get[Boolean]("enabled") map {
      case name~parent~rank~enabled => Category(name.get, parent.getOrElse(""), rank, enabled)
    }
  }

  def findAll(): Seq[Category] = {
    DB.withConnection { implicit connection =>
      SQL("select * from category").as(parser *)
    }
  }

  def create(category: Category): Unit = {
    DB.withConnection { implicit connection =>
      SQL("insert into category(name, parent, rank, enabled) values ({name}, {parent}, {rank}, {enabled})").on(
        'name -> category.name,
        'parent -> category.parent,
        'rank -> category.rank,
        'enabled -> category.enabled
      ).executeUpdate()
    }
  }
}

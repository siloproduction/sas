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
    get[Pk[Long]]("id") ~
    get[String]("name") ~
    get[Option[Long]]("parent") ~
    get[Option[String]]("link") ~
    get[Int]("rank") ~
    get[Boolean]("enabled") map {
      case id~name~parent~link~rank~enabled => Category(id.get, name, CategoryDao.findByIdOption(parent).getOrElse(Category.noCategory), link, rank, enabled)
    }
  }

  def delete(id: Long): Int = {
    DB.withConnection { implicit connection =>
      SQL("DELETE FROM category WHERE id={id}").on(
        'id -> id
      ).executeUpdate()
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
        'parent -> category.parent.id,
        'link -> category.link,
        'rank -> category.rank,
        'enabled -> category.enabled
      ).executeUpdate()
    }
  }

  def update(category: Category): Unit = {
    if (category.isCategoryNone() || category.isParentLoop()) {
      return
    }
    DB.withConnection { implicit connection =>
      SQL("UPDATE category SET name={name}, parent={parent}, link={link}, rank={rank}, enabled={enabled}" +
        " WHERE category.id={id}").on(
          'id -> category.id,
          'name -> category.name,
          'parent -> category.parent.id,
          'link -> category.link,
          'rank -> category.rank,
          'enabled -> category.enabled
      ).executeUpdate()
    }
  }

  def isValidParent(parent: Long):Boolean = {
    DB.withConnection { implicit connection =>
      SQL("select 1 from category where id={id}").on(
        'id -> parent
      ).execute()
    }
  }

  def findByName(name: String) = findByNameOption(Option.apply(name)).get
  def findByNameOption(name: Option[String]): Option[Category] = {
    if (name.isEmpty)
      return Option.empty
    DB.withConnection { implicit connection =>
      SQL("select * from category where name={name}").on(
        'name -> name
      ).as(parser *)
        .headOption
    }
  }
  def findById(id: Long) = findByIdOption(Option.apply(id)).get
  def findByIdOption(id: Option[Long]): Option[Category] = {
    if (id.isEmpty)
      return Option.empty
    DB.withConnection { implicit connection =>
      SQL("select * from category where id={id}").on(
        'id -> id
      ).as(parser *)
        .headOption
    }
  }
}

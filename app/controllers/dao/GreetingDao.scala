package controllers.dao

import play.api.db._
import play.api.Play.current

import anorm._
import anorm.SqlParser._
import controllers.bean.Greeting

/**
 * @Author("bltCrew")
 */
object GreetingDao {

  val simple = {
    get[Pk[Long]]("id") ~
    get[String]("name") ~
    get[Int]("repeat") ~
    get[Option[String]]("color") map {
      case id~name~repeat~color => {
        val greeting = Greeting(name, repeat, color)
        greeting.id = id.get
        greeting
      }
    }
  }

  def findAll(): Seq[Greeting] = {
    DB.withConnection { implicit connection =>
      SQL("select * from greeting").as(simple *)
    }
  }

  def create(greeting: Greeting): Unit = {
    DB.withConnection { implicit connection =>
      SQL("insert into greeting(name, repeat, color) values ({name}, {repeat}, {color})").on(
        'name -> greeting.name,
        'repeat -> greeting.repeat,
        'color -> greeting.color
      ).executeUpdate()
    }
  }
}

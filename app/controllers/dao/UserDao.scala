package controllers.dao

import play.api.db._
import play.api.Play.current

import anorm._
import anorm.SqlParser._
import controllers.bean.{UserProfile, User}
import controllers.bean.UserProfile._

/**
 * @Author("bltCrew")
 */
object UserDao {

  val parser = {
    get[Pk[String]]("login") ~
    get[String]("password") ~
    get[String]("profile") map {
      case login~password~profile => User(login.get, password, UserProfile.withName(profile))
    }
  }

  def findAll(): Seq[User] = {
    DB.withConnection { implicit connection =>
      SQL("select * from user").as(parser *)
    }
  }

  def create(user: User): Unit = {
    DB.withConnection { implicit connection =>
      SQL("insert into user(login, password, profile) values ({login}, {password}, {profile})").on(
        'login -> user.login,
        'password -> user.password,
        'profile -> user.profile.toString
      ).executeUpdate()
    }
  }
}

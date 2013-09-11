package controllers.dao

import play.api.db._
import play.api.Play.current

import anorm._
import anorm.SqlParser._
import controllers.bean.{Credentials, UserProfile, User}
import controllers.{InvalidCredentialsException, UserNotFoundException}

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
      SQL("select * from users").as(parser *)
    }
  }

  def delete(userLogin: String): Int = {
    DB.withConnection { implicit connection =>
      SQL("DELETE FROM users WHERE login={login}").on(
        'login -> userLogin
      ).executeUpdate()
    }
  }

  def create(user: User): Unit = {
    DB.withConnection { implicit connection =>
      SQL("insert into users(login, password, profile) values ({login}, {password}, {profile})").on(
        'login -> user.login,
        'password -> user.password,
        'profile -> user.profile.toString
      ).executeUpdate()
    }
  }

  def update(originalLogin: String, user: User): Unit = {
    DB.withConnection { implicit connection =>
      SQL("UPDATE users SET login={login}, password={password}, profile={profile}" +
        " WHERE users.login={originalLogin}").on(
        'login -> user.login,
        'password -> user.password,
        'profile -> user.profile.toString,
        'originalLogin -> originalLogin
      ).executeUpdate()
    }
  }

  def findByLogin(login: String): User = {
    DB.withConnection { implicit  connection =>
      SQL("select * from users where login={login}").on(
        'login -> login
      ).as(parser *).head
    }
  }

  def login(credentials: Credentials): User = {
    DB.withConnection { implicit connection =>
      val userOption = SQL("select * from users where login = {login}")
        .on('login -> credentials.login)
        .parse(parser *)
        .headOption

      userOption match {
        case None => throw new UserNotFoundException("user with login: " + credentials.login + "has not been found")
        case user:Some[User] => {
          user.get.password match {
            case credentials.password => user.get
            case _ => throw new InvalidCredentialsException("Invalid credentials")
          }
        }
      }
    }
  }
}

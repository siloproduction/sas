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
    get[Pk[Long]]("id") ~
    get[String]("login") ~
    get[String]("password") ~
    get[String]("profile") map {
      case id~login~password~profile => User(id.get, login, Some(password), UserProfile.withName(profile))
    }
  }

  def findAll(): Seq[User] = {
    DB.withConnection { implicit connection =>
      SQL("select * from users order by login asc").as(parser *)
    }
  }

  def delete(userId: Long): Int = {
    DB.withConnection { implicit connection =>
      SQL("DELETE FROM users WHERE id={id}").on(
        'id -> userId
      ).executeUpdate()
    }
  }

  def create(user: User): Long = {
    try {
      DB.withConnection { implicit connection =>
        SQL("insert into users(login, password, profile) values ({login}, {password}, {profile})").on(
          'login -> user.login,
          'password -> user.password,
          'profile -> user.profile.toString
        ).executeInsert().get
      }
    } catch {
      case e: Exception => throw new DAOException("Cannot create user: " + e.getMessage)
    }
  }

  def update(user: User): Unit = {
    if (user.password.isDefined) {
      updateWithPassword(user)
    } else {
      updateWithoutPassword(user)
    }
  }

  def updateWithPassword(user: User): Unit = {
    DB.withConnection { implicit connection =>
      SQL("UPDATE users SET login={login}, password={password}, profile={profile}" +
        " WHERE users.id={id}").on(
        'login -> user.login,
        'password -> user.password,
        'profile -> user.profile.toString,
        'id -> user.id
      ).executeUpdate()
    }
  }

  def updateWithoutPassword(user: User): Unit = {
    DB.withConnection { implicit connection =>
      SQL("UPDATE users SET login={login}, profile={profile}" +
        " WHERE users.id={id}").on(
        'login -> user.login,
        'profile -> user.profile.toString,
        'id -> user.id
      ).executeUpdate()
    }
  }

  def findById(id: Long): User = {
    DB.withConnection { implicit  connection =>
      SQL("select * from users where id={id}").on(
        'id -> id
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
        case user:Some[User] => { user.get.password match {
            case None => throw new UserNotFoundException("user with login: " + credentials.login + "has no password")
            case pwd:Some[String] => { pwd.get match {
                case credentials.password => user.get
                case _ => throw new InvalidCredentialsException("Invalid credentials")
              }
            }
          }
        }
      }
    }
  }
}

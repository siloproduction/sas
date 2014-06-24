package controllers.dao

import play.api.db._
import play.api.Play.current

import anorm._
import anorm.SqlParser._
import controllers.bean.{Credentials, UserProfile, User}
import controllers.{InvalidCredentialsException, UserNotFoundException}
import org.mindrot.jbcrypt.BCrypt

object UserDao {

  val FIELDS = "id, email, login, profile"

  val parser = {
    get[Pk[Long]]("id") ~
    get[String]("email") ~
    get[String]("login") ~
    get[String]("profile") map {
      case id~email~login~profile => User(id.get, email, login, None, UserProfile.withName(profile))
    }
  }

  def findAll(): Seq[User] = {
    DB.withConnection { implicit connection =>
      SQL(s"select ${FIELDS} from users order by login asc").as(parser *)
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
        SQL("insert into users(email, login, password, profile) values ({email}, {login}, {password}, {profile})").on(
          'email -> user.email,
          'login -> user.login,
          'password -> encryptPassword(user),
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
      SQL("UPDATE users SET email={email}, login={login}, password={password}, profile={profile}" +
        " WHERE users.id={id}").on(
        'email -> user.email,
        'login -> user.login,
        'password -> encryptPassword(user),
        'profile -> user.profile.toString,
        'id -> user.id
      ).executeUpdate()
    }
  }

  def updateWithoutPassword(user: User): Unit = {
    DB.withConnection { implicit connection =>
      SQL("UPDATE users SET email={email}, login={login}, profile={profile}" +
        " WHERE users.id={id}").on(
        'email -> user.email,
        'login -> user.login,
        'profile -> user.profile.toString,
        'id -> user.id
      ).executeUpdate()
    }
  }

  def findById(id: Long): User = {
    DB.withConnection { implicit  connection =>
      SQL(s"select ${FIELDS} from users where id={id}").on(
        'id -> id
      ).as(parser *).head
    }
  }

  def findByEmail(email: String): User = {
    DB.withConnection { implicit  connection =>
      SQL(s"select ${FIELDS} from users where email={email}").on(
        'email -> email
      ).as(parser *).head
    }
  }

  def login(credentials: Credentials): User = {
    DB.withConnection { implicit connection =>
      val passwordRowOption = SQL(s"select password from users where email = {email}")
        .on('email -> credentials.email)
        .singleOpt()

      passwordRowOption match {
        case None => throw new UserNotFoundException("user with email: " + credentials.email + "has not been found")
        case passwordRow:Some[Row] => {
          BCrypt.checkpw(credentials.password, passwordRow.get[String]("password")) match {
              case true => findByEmail(credentials.email)
              case false => throw new InvalidCredentialsException("Invalid credentials")
          }
        }
      }
    }
  }

  def encryptPassword(user: User) = BCrypt.hashpw(user.password.get, BCrypt.gensalt(12))
}

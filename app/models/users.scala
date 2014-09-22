package models

import play.api.db._
import play.api.Play.current
import anorm._
import anorm.SqlParser._
import play.api.libs.json.Json
import play.api.libs.json._
import org.mindrot.jbcrypt.BCrypt

case class User(id: Pk[Long], email: String, login: String, password: String, profile: String)


object User {
  val parser = {
    get[Pk[Long]]("id") ~
      get[String]("email") ~
      get[String]("login") ~
      get[String]("password") ~
      get[String]("profile") map {
      case id~email~login~password~profile => User(id, email, login, password, profile)
    }
  }

  def findAll(): Seq[User] = {
    DB.withConnection { implicit connection =>
      SQL(s"select * from users order by login asc").as(parser *)
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
    try
      DB.withConnection { implicit connection =>
        SQL("insert into users(email, login, password, profile) values ({email}, {login}, {password}, {profile})").on(
          'email -> user.email,
          'login -> user.login,
          'password -> user.password,
          'profile -> user.profile
        ).executeUpdate()
      }
    /*catch {
     case e: Exception => throw new DAOException("Cannot create user: " + e.getMessage)
   }*/
  }
  def findById(id: Long): User = {
    DB.withConnection { implicit  connection =>
      SQL(s"select * from users where id={id}").on(
        'id -> id
      ).as(parser *).head
    }
  }

  def findByEmail(email: String): User = {
    DB.withConnection { implicit  connection =>
      SQL(s"select * from users where email={email}").on(
        'email -> email
      ).as(parser *).head
    }
  }
  def encryptPassword(user: User) = BCrypt.hashpw(user.password, BCrypt.gensalt(12))


  /*

  def findAll(): Seq[User] = {
    DB.withConnection { implicit connection =>
      SQL("select * from users").as(UserParser *)
    }
  }

  def find(id: Int): Option[User] = {
    DB.withConnection { implicit connection =>
      SQL("SELECT * from users WHERE id = {id}")
        .on('id -> id)
        .as(UserParser.singleOpt)
    }
  }

  def save(name: String) {
    DB.withConnection { implicit connection =>
      SQL("""
            INSERT INTO users(name)
            VALUES({name})
          """).on(
          'name -> name)
        .executeUpdate
    }
  }*/
}



package models

import play.api.db._
import play.api.Play.current

import anorm._
import anorm.SqlParser._

case class User(id: Pk[Long], email: String, login: String, password: String, profile: String)
/*
object User {
  def findAll(): Seq[User] = {
    DB.withConnection { implicit connection =>
      SQL("select * from users").as()
    }
  }
}*/
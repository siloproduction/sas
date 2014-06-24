package controllers.bean


import play.api.data._
import play.api.data.Forms._
import controllers.dao.{UserDao, CategoryDao}
import controllers.{InvalidCredentialsException, UserNotFoundException}

case class Credentials(email: String, password: String)
object LoginForm {

  def create() =  {
    Form(mapping(
      "email" -> email,
      "password" -> nonEmptyText
    ) ((email, password) => Credentials(email, password))
      ((credentials) => Some(credentials.email, credentials.password))
    )
  }
}
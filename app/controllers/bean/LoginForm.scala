package controllers.bean


import play.api.data._
import play.api.data.Forms._
import controllers.dao.{UserDao, CategoryDao}
import controllers.{InvalidCredentialsException, UserNotFoundException}

case class Credentials(login: String, password: String)
object LoginForm {

  def create() =  {
    Form(mapping(
      "login" -> text
        .verifying("3 characters minimum", fields => fields match {
        case (msg) => msg.size > 2
      })
        .verifying("no space allowed", fields => fields match {
        case (msg) => !msg.contains(" ")
      }),
      "password" -> nonEmptyText
    ) ((login, password) => Credentials(login, password))
      ((credentials) => Some(credentials.login, credentials.password))
    )
  }
}
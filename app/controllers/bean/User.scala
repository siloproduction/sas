package controllers.bean

import UserProfile.UserProfile

import play.api.data._
import play.api.data.Forms._

case class User(login: String, password: String, profile: UserProfile) {
  def credentials = Credentials(login, password)
}

object UserForm {

  def create() =  {
    Form(mapping(
      "login" -> text
                .verifying("3 characters minimum", fields => fields match {
                  case (msg) => msg.size > 2
                })
                .verifying("no space allowed", fields => fields match {
                  case (msg) => !msg.contains(" ")
                }),
      "password" -> text
                .verifying("8 characters minimum", fields => fields match {
                  case (msg) => msg.size > 7
                }),
      "profile" -> text
                .verifying("admin or user", fields => fields match {
                  case (msg) => UserProfile.of(msg).isDefined
                })
    )((login, password, profile) => User(login, password, UserProfile.of(profile).get))
     ((user) => Some(user.login, user.password, user.profile.toString))
    )
  }
}
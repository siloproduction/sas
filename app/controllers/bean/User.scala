package controllers.bean

import UserProfile.UserProfile

import play.api.data._
import play.api.data.Forms._

case class User(id: Long = 0, email: String, login: String, password: Option[String] = None, profile: UserProfile) {
  def credentials = Credentials(email, password.get)
}
object User {
  def asUpdateFormId(user: User): String = asUpdateFormId(user.id)
  def asUpdateFormId(id: Long) = "admin-update-user-" + id
  val asCreateFormId = "admin-create-user"
}
object UserForm {

  def update(): Form[User] = {
    Form(mapping(
      "id" -> longNumber,
      "email" -> email,
      "login" -> text
        .verifying("3 characters minimum", fields => fields match {
        case (msg) => msg.size > 2
      })
        .verifying("no space allowed", fields => fields match {
        case (msg) => !msg.contains(" ")
      }),
      "password" -> optional(text)
        .verifying("8 characters minimum", fields => fields match {
        case (msg) => msg.getOrElse("moreThanSeven").size > 7
      }),
      "profile" -> text
        .verifying("admin or user", fields => fields match {
        case (msg) => UserProfile.of(msg).isDefined
      })
    )
      ((id, email, login, password, profile) => User(id, email, login, password, UserProfile.of(profile).get))
      ((user) => Some(user.id, user.email, user.login, user.password, user.profile.toString))
  )}

  def create() =  {
    Form(mapping(
      "id" -> longNumber,
      "email" -> email,
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
    )
      ((id, email, login, password, profile) => User(id, email, login, Some(password), UserProfile.of(profile).get))
      ((user) => Some(user.id, user.email, user.login, user.password.orNull, user.profile.toString))
    )}
}
package controllers.bean

import UserProfile.UserProfile

import play.api.data._
import play.api.data.Forms._

case class User(id: Long = 0, login: String, password: String, profile: UserProfile) {
  def credentials = Credentials(login, password)
}
object User {
  def asUpdateFormId(user: User): String = asUpdateFormId(user.id)
  def asUpdateFormId(id: Long) = "admin-update-user-" + id
  val asCreateFormId = "admin-create-user"
}
object UserForm {

  def update(user: User): Form[User] =  create().fill(user)

  def create() =  {
    Form(mapping(
      "id" -> longNumber,
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
    )((id, login, password, profile) => User(id, login, password, UserProfile.of(profile).get))
     ((user) => Some(user.id, user.login, user.password, user.profile.toString))
    )
  }
}
package json

import play.api.libs.json._
import controllers.bean.{UserProfile, User}
import controllers.bean.UserProfile._
import play.api.libs.json.JsString
import play.api.libs.functional.syntax._

object JsonWriters {

  implicit val readsUserProfile = EnumUtils.enumReads(UserProfile)
  implicit val writesUserProfile = new Writes[UserProfile] {
    def writes(profile: UserProfile) = JsString(profile.toString)
  }

  implicit val userReads: Reads[User] = (
    (__ \ "id").read[Long] ~
    (__ \ "email").read[String] ~
    (__ \ "login").read[String] ~
    (__ \ "password").readNullable[String] ~
    (__ \ "profile").read[UserProfile]
    )(User.apply _)

  implicit val userWrites = new Writes[User] {
    def writes(user: User) = Json.obj(
      "id" -> user.id,
      "email" -> user.email,
      "login" -> user.login,
      "profile" -> user.profile.toString
    )
  }
  /*
  implicit val userWrites = (
    (__ \ 'id).format[Long] and
    (__ \ 'login).format[String] and
    (__ \ 'password).format[String] and
    (__ \ 'profile).format[UserProfile]
  )(User.apply, unlift(User.unapply))
*/
  //implicit val fmtUser = Json.format[User]
  //implicit val userFormat: Format[User] =
    //Format(userReads, userWrites)

  /*

  /////////////////////////
  //////// WRITERS
  /////////////////////////
  implicit val userProfileWrites = new Writes[UserProfile] {
    def writes(profile: UserProfile) = JsString(profile.toString)
  }

  implicit val userWrites = new Writes[User] {
    def writes(user: User) = Json.obj(
      "id" -> user.id,
      "login" -> user.login,
      "profile" -> user.profile
    )
  }

  /////////////////////////
  //////// READERS
  /////////////////////////
  implicit val userProfileReads: Reads[UserProfile] = null

  implicit val userReads: Reads[User] = (
    (__ \ "id").read[Long] ~
    (__ \ "login").read[String] ~
    (__ \ "password").read[String] ~
    (__ \ "profile").read[UserProfile]
    )(User)

  */
}

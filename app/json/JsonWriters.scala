package json

import play.api.libs.json._
import controllers.bean.{Category, Page, UserProfile, User}
import controllers.bean.UserProfile._
import play.api.libs.json.JsString
import play.api.libs.functional.syntax._
import controllers.dao.CategoryDao
import scala.collection.Traversable
import scala.Traversable
import play.api.libs.json.Json._
import play.api.libs.json.JsArray
import controllers.bean.User
import play.api.libs.json.JsSuccess
import play.api.libs.json.JsString
import scala.Some
import play.api.libs.json.JsNumber

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

  implicit val pageReads: Reads[Page] = (
    (__ \ "id").read[Long] ~
    (__ \ "name").read[String] ~
    (__ \ "category").read[Category](categoryByIdReads) ~
    (__ \ "permanentLink").read[String] ~
    (__ \ "data").read[String] ~
    (__ \ "rank").read[Int] ~
    (__ \ "enabled").read[Boolean]
    )(Page.apply _)

  implicit val pageWrites: Writes[Page] = (
    (__ \ "id").write[Long] and
    (__ \ "name").write[String] and
    (__ \ "category").lazyWrite(categoryLightWrites) and
    (__ \ "permanentLink").write[String] and
    (__ \ "data").write[String] and
    (__ \ "rank").write[Int] and
    (__ \ "enabled").write[Boolean]
    )(unlift(Page.unapply))

  implicit val categoryReads: Reads[Category] = (
    (__ \ "id").read[Long] ~
    (__ \ "name").read[String] ~
    (__ \ "parent").readNullable[Category](categoryByIdReads) ~
    (__ \ "link").readNullable[String] ~
    (__ \ "rank").read[Int] ~
    (__ \ "enabled").read[Boolean]
    )(Category.apply _)

  implicit val categoryWrites: Writes[Category] = (
    (JsPath \ "id").write[Long] and
    (JsPath \ "name").write[String] and
    (JsPath \ "parent").lazyWriteNullable(categoryLightWrites) and
    (JsPath \ "link").writeNullable[String] and
    (JsPath \ "rank").write[Int] and
    (JsPath \ "enabled").write[Boolean]
    )(unlift(Category.unapply))

  val categoryLightWrites: Writes[Category] = (
    (JsPath \ "id").write[Long] and
    (JsPath \ "name").write[String]
    ).apply(c => (c.id, c.name))

  def categoryByIdReads = new Reads[Category] {
    def reads(json: JsValue): JsResult[Category] = json match {
      case JsNumber(id) => {
        try {
          JsSuccess(CategoryDao.findById(id.toLong))
        } catch {
          case _: NoSuchElementException => JsError(s"Category not found '${id}'")
        }
      }
      case _ => JsError("Number value expected")
    }
  }

}

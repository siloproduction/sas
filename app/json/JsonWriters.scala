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
    (JsPath \ "id").write[Long] and
    (JsPath \ "name").write[String] and
    (JsPath \ "category").lazyWrite(categoryWrites) and
    (JsPath \ "permanentLink").write[String] and
    (JsPath \ "data").write[String] and
    (JsPath \ "rank").write[Int] and
    (JsPath \ "enabled").write[Boolean]
    )(unlift(Page.unapply))

  implicit val categoryReads: Reads[Category] = (
    (__ \ "id").read[Long] ~
    (__ \ "name").read[String] ~
    (__ \ "parent").readNullable[Category](categoryByIdReads) ~
    (__ \ "link").readNullable[String] ~
    (__ \ "rank").read[Int] ~
    (__ \ "enabled").read[Boolean]
    )(Category.apply _)

  implicit val categoryWrites = new Writes[Category] {
    def writes(category: Category) = {
      val parentId = category.parent match {
        case Some(p) => p.id
        case _ => -1
      }
      Json.obj(
        "id" -> category.id,
        "name" -> category.name,
        "parent" -> parentId,
        "link" -> category.link.orNull,
        "rank" -> category.rank,
        "enabled" -> category.enabled
      )
    }
  }

  def categoryByIdReads = new Reads[Category] {
    def reads(json: JsValue): JsResult[Category] = json match {
      case JsNumber(id) => {
        try {
          System.err.println(1)
          JsSuccess(CategoryDao.findById(id.toLong))
        } catch {
          case _: NoSuchElementException => JsError(s"Category not found '${id}'")
        }
      }
      case _ => JsError("Number value expected")
    }
  }

}

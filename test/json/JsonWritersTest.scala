package json

import org.specs2.mutable.Specification

import json.JsonWriters._

import play.api.test._
import play.api.test.Helpers._
import play.api.libs.json.{JsObject, Json}
import controllers.bean.{UserProfile, User}
import controllers.bean.UserProfile._
import play.api.libs.functional._
import play.api.libs.functional.syntax._

class JsonWritersTest extends Specification {

    val USER = User(id = 3, login = "login", password = None, profile = UserProfile.Admin)
    val USER_WITH_PWD = User(id = 3, login = "login", password = Some("shoud not be shown"), profile = UserProfile.Admin)
    val USER_JSON = """{"id":3,"login":"login","profile":"Admin"}"""
    val USER_JSON_WITH_PWD = """{"id":3,"login":"login","password":"shoud not be shown","profile":"Admin"}"""

    "JsonWriters" should {

      "produce this json for user" in {
        Json.stringify(Json.toJson(USER)) mustEqual USER_JSON
      }

      "produce this json for user with password" in {
        Json.stringify(Json.toJson(USER_WITH_PWD)) mustEqual USER_JSON
      }

      "parse this user for json" in {
        Json.fromJson[User](Json.parse(USER_JSON)).asOpt.get mustEqual USER
      }

      "parse this user for json with password" in {
        Json.fromJson[User](Json.parse(USER_JSON_WITH_PWD)).asOpt.get mustEqual USER_WITH_PWD
      }
    }
}
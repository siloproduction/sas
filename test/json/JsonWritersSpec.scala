package test

import org.specs2.mutable._

import play.api.test._
import play.api.test.Helpers._

import Mixture._
import json.JsonWriters._
import play.api.libs.json.Json
import controllers.bean.{Page, Category, UserProfile, User}
import controllers.dao.CategoryDao

object Mixture {

  val USER = User(id = 3, email = "login@domain.test", login = "login", password = None, profile = UserProfile.Admin)
  val USER_WITH_PWD = User(id = 3, email = "login@domain.test", login = "login", password = Some("shoud not be shown"), profile = UserProfile.Admin)
  val USER_JSON = """{"id":3,"email":"login@domain.test","login":"login","profile":"Admin"}"""
  val USER_JSON_WITH_PWD = """{"id":3,"email":"login@domain.test","login":"login","password":"shoud not be shown","profile":"Admin"}"""

  val CATEGORY_NONE = Category.noCategory
  val CATEGORY = Category(id = 3, name = "name", parent = None, link = Some("link_c ool"), rank = 3, enabled = true)
  val CATEGORY_WITH_PARENT = Category(id = 5, name = "name2", parent = Some(CATEGORY), link = Some("link"), rank = 6, enabled = false)
  val CATEGORY_WITH_PARENT_NONE = Category(id = 9, name = "name3", parent = Some(CATEGORY_NONE), link = Some("link2"), rank = 9, enabled = true)
  val CATEGORY_JSON = """{"id":3,"name":"name","link":"link_c ool","rank":3,"enabled":true}"""
  val CATEGORY_JSON_WITH_PARENT = s"""{"id":5,"name":"name2","parent":{"id":${CATEGORY.id},"name":"${CATEGORY.name}"},"link":"link","rank":6,"enabled":false}"""

  val PAGE = Page(id = 8, name = "a page", category = CATEGORY_NONE, permanentLink = "the link_p", data = "the data", rank = 2, enabled = true)
  val PAGE_JSON = s"""{"id":8,"name":"a page","category":{"id":${CATEGORY_NONE.id},"name":"${CATEGORY_NONE.name}"},"permanentLink":"the link_p","data":"the data","rank":2,"enabled":true}"""

}

class JsonWritersUserSpec extends Specification {
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
class JsonWritersCategorySpec extends Specification {
  "JsonWriters" should {

    "produce this json for category" in {
      Json.stringify(Json.toJson(CATEGORY)) mustEqual CATEGORY_JSON
    }

    "produce this json for category with parent" in {
      Json.stringify(Json.toJson(CATEGORY_WITH_PARENT)) mustEqual CATEGORY_JSON_WITH_PARENT
    }

    "parse this category for json" in {
      Json.fromJson[Category](Json.parse(CATEGORY_JSON)).asOpt.get mustEqual CATEGORY
    }

    "parse this category for json with parent" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        val idSql = CategoryDao.create(CATEGORY_WITH_PARENT_NONE)
        val json = s"""{"id":5,"name":"name2","parent":${idSql},"link":"link2","rank":6,"enabled":false}"""
        Json.fromJson[Category](Json.parse(json)).asOpt.get mustEqual
          Category(id = 5, name = "name2", parent = Some(CATEGORY_WITH_PARENT_NONE.copy(id = idSql)), link = Some("link2"), rank = 6, enabled = false)
      }
    }
  }
}

class JsonWritersPageSpec extends Specification {
  "JsonWriters" should {

    "produce this json for page" in {
      Json.stringify(Json.toJson(PAGE)) mustEqual PAGE_JSON
    }

    "parse this page for json" in {
      running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
        val idSql = CategoryDao.create(CATEGORY_WITH_PARENT_NONE)
        val json = s"""{"id":8,"name":"a page","category":${idSql},"permanentLink":"the link_p","data":"the data","rank":2,"enabled":true}"""
        val expectedPage = Page(id = 8, name = "a page", category = CATEGORY_WITH_PARENT_NONE.copy(id = idSql), permanentLink = "the link_p", data = "the data", rank = 2, enabled = true)
        Json.fromJson[Page](Json.parse(json)).asOpt.get mustEqual expectedPage
      }
    }
  }
}
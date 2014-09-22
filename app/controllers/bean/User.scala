package controllers.bean

import play.api.data._
import play.api.data.Forms._

case class User(id: Long = 0, email: String, login: String)
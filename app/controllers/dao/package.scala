package controllers

package object dao {

  case class DAOException(message: String) extends  Exception(message)

}

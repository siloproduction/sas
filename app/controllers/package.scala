/**
 * @Author( " b l t C r e w " )
 */
package object controllers {

  case class UserNotFoundException(msg: String) extends Exception
  case class InvalidCredentialsException(msg: String) extends Exception

}

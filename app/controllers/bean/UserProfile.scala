package controllers.bean

object UserProfile extends Enumeration {
  type UserProfile = Value
  val Admin, User = Value

  val mapping = Map(
      Admin -> "admin",
      User -> "user"
  )
  val reverse = Map(
    "admin" -> Admin,
    "user" -> User
  )

  def of(name: String) = reverse.get(name).get

}
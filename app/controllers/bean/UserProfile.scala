package controllers.bean

object UserProfile extends Enumeration {
  type UserProfile = Value
  val Admin, User = Value

  val mapping = Map(
      Admin -> "Admin",
      User -> "User"
  )
  val reverse = Map(
    "Admin" -> Admin,
    "User" -> User
  )

  def of(name: String) = reverse.get(name)

}
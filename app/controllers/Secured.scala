package controllers

import play.api.mvc._
import controllers.bean.{User, UserProfile}

/**
 * Provide security features
 */
trait Secured {

    /**
     * Retrieve the connected user email.
     */
    private def username(request: RequestHeader) = request.session.get("user.login")

    /**
     * Redirect to login if the user in not authorized.
     */
    private def onUnauthorized(request: RequestHeader) = Results.Redirect(routes.Application.login)

    // --

    /**
     * Action for authenticated users.
     */
    def IsAuthenticated(f: => String => Request[AnyContent] => Result) = Security.Authenticated(username, onUnauthorized) { user =>{
        Action(request => f(user)(request))
      }
    }

    def IsAdmin(f: => String => Request[AnyContent] => Result) = IsAuthenticated { user => request =>
      val userProfile: Option[String] = request.session.get("user.profile")
      if(userProfile.isDefined && UserProfile.Admin == UserProfile.withName(userProfile.get)) {
        f(user)(request)
      } else {
        Results.Forbidden
      }
    }

    def IsAuthTmp(key: String)(f: => String => Request[AnyContent] => Result) = IsAuthenticated { user => request =>
      if(key.equals("tmp")) {
        f(user)(request)
      } else {
        Results.Forbidden
      }
    }

    def user(implicit request: Request[AnyContent]): Option[User] = {
      request.session.get("user.login") match {
        case x:Some[String] => Option.apply(User.apply(
          x.get,
          request.session.get("user.password").get,
          request.session.get("user.profile").map { profile => bean.UserProfile.of(profile).get}.get ))
        case _ => Option.empty
      }
    }
}

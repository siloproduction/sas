import org.mindrot.jbcrypt.BCrypt
import play.api.mvc._
import scala.concurrent.Future

object Global extends WithFilters(HostFilter) {

}

object HostFilter extends Filter with Results {

  val REDITECT_FROM = "annehengy.herokuapp.com"
  val REDITECT_TO = "http://www.annehengy.fr"

  def apply(next: (RequestHeader) => Future[SimpleResult])(request: RequestHeader): Future[SimpleResult] = {
    request.headers.get("host") match {
      case None => next(request)
      case Some(host) => host match {
        case REDITECT_FROM => Future.successful(MovedPermanently(REDITECT_TO))
        case _ => next(request)
      }
    }
  }
}
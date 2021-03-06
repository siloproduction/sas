import sbt._
import Keys._
import play.Project._

object ApplicationBuild extends Build {

  val appName         = "eventapp"
  val appVersion      = "1.0-SNAPSHOT"

  val appDependencies = Seq(
    // Add your project dependencies here,
    jdbc,
    anorm,
    "postgresql" % "postgresql" % "9.1-901-1.jdbc4",
    "org.mindrot" % "jbcrypt" % "0.3m",
    "ws.securesocial" %% "securesocial" % "2.1.4"
  )


  val main = play.Project(appName, appVersion, appDependencies).settings(
    // Add your own project settings here
    resolvers += "JBoss repository" at "https://repository.jboss.org/nexus/content/repositories/",
    resolvers += "Scala-Tools Maven2 Snapshots Repository" at "http://scala-tools.org/repo-snapshots",
    resolvers += Resolver.sonatypeRepo("releases")
  )

}

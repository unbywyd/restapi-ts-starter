import { env } from "@base/utils/env";
import { toBool } from "@base/utils/to-bool";
import path from "path";

function getAppPath() {
  return path.join(__dirname, "..");
}
export const appConfig = {
  node: env("NODE_ENV") || "development",
  isProduction: env("NODE_ENV") === "production",
  isStaging: env("NODE_ENV") === "staging",
  isDevelopment: env("NODE_ENV") === "development",
  name: env("APP_NAME"),
  port: Number(env("APP_PORT")),
  routePrefix: env("APP_ROUTE_PREFIX"),
  url: env("APP_URL"),
  appPath: getAppPath(),
  cronJobsEnabled: toBool(env("ENABLE_CRON_JOBS")),

  // переменная: разрешить создавать водителей если их нет
  sendGridApiKey: env("SENDGRID_API_KEY"),
  sendGridSenderEmail: env("SENDGRID_SENDER_EMAIL"),

  jwtSecret: env("JWT_SECRET"),
  inforuToken: env("INFORUTOKEN"),
  inforuTokenFuture: env("INFORUTOKEN_FUTURE"),
  inforuKey: env("INFORU_KEY"),

  controllersDir: env("CONTROLLERS_DIR"),
  cronJobsDir: env("CRON_JOBS_DIR"),
  middlewaresDir: env("MIDDLEWARES_DIR"),
  servicesDir: env("SERVICES_DIR"),
  eventsDir: env("EVENTS_DIR"),
  hooksDir: env("HOOKS_DIR"),
  initFilesDir: env("INIT_FILES"),
  socketControllersDir: env("SOCKET_CONTROLLERS_DIR"),
  installFilesDir: env("INSTALL_FILES"),
  logsDir: env("LOGS_DIR"),

  s3BucketNamePub: env("S3_BUCKET_NAME_PUB"),
  s3BucketNamePriv: env("S3_BUCKET_NAME_PRIV"),
  s3Region: env("S3_REGION"),
  s3AccessKeyId: env("S3_ACCESS_KEY_ID"),
  s3SecretAccessKey: env("S3_SECRET_ACCESS_KEY")
};
import "reflect-metadata";
import { fixModuleAlias } from "./utils/fix-module-alias";
fixModuleAlias(__dirname);
import { appConfig } from "@base/config/app";
import {
  useContainer as routingControllersUseContainer,
  useExpressServer,
  getMetadataArgsStorage,
  ExpressMiddlewareInterface,
  Middleware,
} from "routing-controllers";
import { loadHelmet } from "@base/utils/load-helmet";
import { Container } from "typedi";

import * as path from "path";
import express from "express";
import { routingControllersToSpec } from "routing-controllers-openapi";
import * as swaggerUiExpress from "swagger-ui-express";
import bodyParser from "body-parser";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import { SocketControllers } from "socket-controllers";
import { glob } from "glob";
import morgan from "morgan";
import { loadEventDispatcher } from "./utils/load-event-dispatcher";
import logger from "./utils/logger";
import { AuthCheckHandler, authGuard } from "./middlewares/auth/auth-check";
import { SocketAuth, responseError } from "./utils/auth";
import { addAppSocketEmitter } from "./utils/socket.utils";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });
import { uploadFiles, uploadPrivateFiles } from "./utils/s3";
import cors from "cors";
import cronTasks from "./utils/cron-tasks";
import AuthService from "./api/auth/auth.service";


/*
*  Fix for the issue with the date format
*/
@Middleware({ type: 'before' })
export class DateStringToDateFormatMiddleware implements ExpressMiddlewareInterface {
  use(request: any, response: any, next: (err?: any) => any): void {
    const convertToDate = (obj: any) => {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];

          if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
            obj[key] = new Date(value);
          } else if (typeof value === 'object') {
            convertToDate(value);
          }
        }
      }
    };
    convertToDate(request.body);
    next();
  }
}


export class App {
  private app: express.Application = express();

  private port = process.env.PORT || appConfig.port;

  public async bootstrap() {
    this.app.use(
      morgan("combined", {
        stream: { write: (message) => logger.info(message.trim()) },
      })
    );

    await this.loadServices();
    await this.loadInit();
    await loadEventDispatcher();
    routingControllersUseContainer(Container);
    this.serveStaticFiles();
    this.setupMiddlewares();
    this.registerRoutingControllers();
    this.registerDefaultHomePage();
    this.register404Page();
    this.setupSwagger();
    await this.registerSocketControllers();
  }


  private serveStaticFiles() {
    this.app.use(
      "/public",
      express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
    );
  }

  private setupMiddlewares() {
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());

    // ANY ROUTE OF EXPRESS
    this.app.post(
      "/api/private/upload",
      cors(),
      upload.array("files"),
      async (req, res) => {
        try {
          const auth = await authGuard(req, res);
          if (!auth) {
            return res.status(401).json({ message: "Unauthorized" })
          } else {
            const result = await uploadPrivateFiles((req as any).files || []);
            res.json(result);
          }
        } catch (err) {
          res.status(500).json({ message: err.message });
        }
      }
    );

    this.app.post(
      "/api/public/upload",
      cors(),
      upload.array("files"),
      async (req, res) => {
        try {
          const auth = await authGuard(req, res);
          if (!auth) {
            return res.status(401).json({ message: "Unauthorized" })
          } else {
            const result = await uploadFiles((req as any).files || []);
            res.json(result);
          }
        } catch (err) {
          res.status(500).json({ message: err.message });
        }
      }
    );

    loadHelmet(this.app);
  }

  private registerSocketControllers() {
    return new Promise((resolve, reject) => {

      const server = require("http").Server(this.app);
      const io = require("socket.io")(server, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
        },
      });

      this.app.use(function (req: any, res: any, next) {
        req.io = io;
        next();
      });

      server.listen(this.port, () => {
        console.log(
          `🚀 Server started at http://localhost:${this.port}\n🚨️ Environment: ${process.env.NODE_ENV}`
        )
        resolve(true);
      });

      server.on("error", (err: any) => {
        reject(err);
      });

      logger.info(`🚀 Server started at http://localhost:${this.port}`);

      logger.info(`🚨️ Environment: ${process.env.NODE_ENV}`);

      logger.info('Documentation is available at http://localhost:3000/docs')

      io.use(async (socket: SocketAuth, next: any) => {
        addAppSocketEmitter(socket);
        const token = socket.handshake.query.authToken as string;

        const originOn = socket.on;
        (socket as any).on = function (event: string, fn: Function) {
          originOn.call(socket, event, async function (data: any) {
            try {
              const json = JSON.parse(data);
              return await fn(json);
            } catch (err) {
              return await fn(data);
            }
          });
        };

        if (!token) {
          next(responseError("Authentication error"));
          return;
        }
        try {
          // Authorize the user to access the socket
          const session = await AuthCheckHandler(token);

          if (session instanceof Error) {
            next(responseError(session.message));
            return;
          } else {
            socket.session = session.session;
            socket.user = session.user;
          }

          next();
        } catch (err) {
          next(responseError(err.message));
        }
      });

      new SocketControllers({
        io,
        container: Container,
        controllers: [__dirname + appConfig.socketControllersDir],
      });
    });
  }

  private registerRoutingControllers() {
    useExpressServer(this.app, {
      validation: { stopAtFirstError: true, whitelist: true },
      cors: true,
      classTransformer: true,
      defaultErrorHandler: false,
      routePrefix: appConfig.routePrefix,
      controllers: [__dirname + appConfig.controllersDir],
      middlewares: [__dirname + appConfig.middlewaresDir],
    });
  }


  private async loadInit() {
    const initPath = __dirname + appConfig.initFilesDir;
    const files = await glob(initPath, {
      cwd: __dirname,
    });
    files.forEach((file) => {
      const absolutePath = path.isAbsolute(file)
        ? file
        : path.join(__dirname, file);
      const listenerClass = require(absolutePath).default;
      if (listenerClass) {
        Container.get(listenerClass);
      }
    });
  }

  private async loadServices() {
    const servicesPath = __dirname + appConfig.servicesDir;
    const files = await glob(servicesPath, {
      cwd: __dirname,
    });
    files.forEach((file) => {
      const absolutePath = path.isAbsolute(file)
        ? file
        : path.join(__dirname, file);
      const listenerClass = require(absolutePath).default;
      if (listenerClass) {
        Container.get(listenerClass);
      }
    });
  }

  private registerDefaultHomePage() {
    this.app.get("/", (req, res) => {
      res.json({
        title: appConfig.name,
        mode: appConfig.node,
        date: new Date(),
      });
    });
  }

  private register404Page() {
    this.app.get("/404", function (req, res) {
      res.status(404).send({ status: 404, message: "Page Not Found!" });
    });
  }

  private setupSwagger() {
    const schemas = validationMetadatasToSchemas({
      refPointerPrefix: "#/components/schemas/",
    }) as any;

    const storage = getMetadataArgsStorage();
    const spec = routingControllersToSpec(
      storage,
      { routePrefix: appConfig.routePrefix },
      {
        components: {
          schemas,
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
        info: {
          description: "Welcome to the API!",
          title: "API Documentation",
          version: "1.0.0",
        },
      }
    );

    this.app.use("/docs", swaggerUiExpress.serve, swaggerUiExpress.setup(spec));
  }
}

const app = new App();

app.bootstrap().then(() => {
  const listenerClass = require(path.join(__dirname, "./api/auth/auth.service")).default;
  const authService = Container.get(listenerClass) as AuthService;
  cronTasks({
    authService,
  });
});
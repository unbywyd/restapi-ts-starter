import {
  ExpressErrorMiddlewareInterface,
  Middleware,
  HttpError,
} from "routing-controllers";
import * as express from "express";
import { Service } from "typedi";

@Service()
@Middleware({ type: "after" })
export class CustomErrorHandler implements ExpressErrorMiddlewareInterface {
  public error(
    error: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) {
    const responseObject = {} as any;
    responseObject.success = false;

    console.log(error);

    // Status code
    if (error instanceof HttpError && error.httpCode) {
      responseObject.status = error.httpCode;
      res.status(error.httpCode);
    } else {
      responseObject.status = 500;
      res.status(500);
    }

    // Message
    responseObject.message = error.message;

    // Class validator handle errors
    if (responseObject.status == 400) {
      let validatorErrors = {} as any;

      if (
        typeof error === "object" &&
        error.hasOwnProperty("errors") &&
        Array.isArray(error.errors)
      ) {
        error.errors.forEach((element: any) => {
          if (element.property && element.constraints) {
            validatorErrors[element.property] = element.constraints;
          }
        });
      } else if (typeof error === "object" && error.hasOwnProperty("errors")) {
        // validatorErrors["common"] = error.errors;
         if(error.errors instanceof Error) {
            validatorErrors["system"] = error.errors.message;
         }
      }
      responseObject.errors = validatorErrors;
    }

    // Append stack
    if (
      error.stack &&
      process.env.NODE_ENV === "development" &&
      responseObject.status == 500
    ) {
      responseObject.stack = error.stack;
    }

    // Final response
    res.json(responseObject);
  }
}

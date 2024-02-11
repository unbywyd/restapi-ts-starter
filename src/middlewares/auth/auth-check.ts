import {
  ExpressMiddlewareInterface,
  UseBefore,
  createParamDecorator,
} from "routing-controllers";
import { Service } from "typedi";
import { Response } from "express";
import { verify } from "@base/utils/auth";
import { OpenAPI } from "routing-controllers-openapi";
import { AuthSession } from "@base/api/auth/auth.domain";

export interface User {
  id: string;
  firebaseToken?: string;
}

export const AuthCheckHandler = async (
  token: string
): Promise<
  | {
    user: User;
    session: AuthSession;
  }
  | Error
> => {
  try {
    const session = await verify<AuthSession>(token);
    if (!session) {
      return new Error("Token is invalid!");
    }
    const userId = session?.id;
    if (!userId) {
      return new Error("Token is invalid!");
    }

    const user = {
      id: userId,
    };

    return { user, session };
  } catch (_) {
    return new Error("Token is invalid!");
  }
};

export async function authGuard(request: any, response: Response): Promise<boolean> {
  const authHeader = request.headers.authorization;
  if (!authHeader) {
    return false
  }
  const token = authHeader.split(/\s+/)[1];
  const session = await AuthCheckHandler(token);
  if (session instanceof Error) {
    return false;
  } else {
    request.session = session.session;
    request.currentUser = session.user;
    return true;
  }
}

@Service()
export class AuthCheck implements ExpressMiddlewareInterface {
  use(request: any, response: Response, next?: (err?: any) => any): any {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return response
        .status(403)
        .send({ status: 403, message: "Unauthorized!" });
    }
    const token = authHeader.split(/\s+/)[1];
    AuthCheckHandler(token).then((session) => {
      if (session instanceof Error) {
        return response
          .status(403)
          .send({ status: 403, message: session.message });
      } else {
        request.session = session.session;
        request.currentUser = session.user;
      }
      next();
    });
  }
}

export function AuthGuard() {
  return function (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor
  ) {
    UseBefore(AuthCheck)(target, propertyKey, descriptor);
    OpenAPI({ security: [{ bearerAuth: [] }] })(
      target,
      propertyKey,
      descriptor
    );
  };
}

export function CurrentSession() {
  return createParamDecorator({
    value: (action) => {
      return action.request.session;
    },
  });
}
export function CurrentUser() {
  return createParamDecorator({
    value: async (action) => {
      return action.request.currentUser;
    },
  });
}

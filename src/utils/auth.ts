import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import { SignJWT, jwtVerify } from "jose";
import { IsNumber, IsString, IsBoolean } from "class-validator";
import { toDTO, toSLug } from "./common";
import { AuthSession } from "@base/api/auth/auth.domain";
import { AppSocket } from "./socket.domain";
import { Expose } from "class-transformer";
import { User } from "@base/middlewares/auth/auth-check";

export type SocketAuth = AppSocket & {
  user: User;
  session: AuthSession;
};

export async function signIn<T extends {}>(payload: T): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 24 * 30; // 30 days

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));
}

export async function verify<T>(token: string): Promise<T> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    return payload as T;
  } catch (e) {
    return null;
  }
}

export class IResponseError {
  @IsString()
  message: string;

  @IsString()
  errors: {};

  @IsNumber()
  status: number = 401;

  constructor(message: string, status: number = 401) {
    this.message = message;
    this.errors = {
      [toSLug(message)]: [message],
    };
    this.status = status;
  }
}

export type ResponseSuccess = {
  success: true
}

export class ResponseSuccessDTO {
  @IsBoolean()
  @Expose()
  success: true = true;
}

export class ResponseSuccessOrFailDTO {
  @IsBoolean()
  @Expose()
  success: boolean;
}

export class ResponseFailDTO {
  @IsBoolean()
  @Expose()
  success: false = false;
}

export function successOrFailResponse(success: boolean): ResponseSuccessOrFailDTO {
  return toDTO(ResponseSuccessOrFailDTO, { success });
}


export type ApiSuccessResponse = ApiResponse<ResponseSuccess>

export type ApiResponse<T> = T | IResponseError;

export function responseError(
  message: string,
  status: number = 401
): IResponseError {
  return new IResponseError(message, status);
}

export function getOpenAPIResponse<T>(
  responseClass: new () => T,
  isArray: boolean = false
) {
  const schemas = validationMetadatasToSchemas({
    refPointerPrefix: "#/components/schemas/",
  });

  const schemaName = responseClass.name;

  if (!schemas[schemaName]) {
    throw new Error(`Schema not found for ${schemaName}`);
  }

  const schemaReference = isArray
    ? { type: "array", items: { $ref: `#/components/schemas/${schemaName}` } }
    : { $ref: `#/components/schemas/${schemaName}` };

  return {
    "400": {
      description: "Bad request",
      content: {
        "application/json": {
          schema: {
            $ref: `#/components/schemas/IResponseError`,
          },
        },
      },
    },
    "200": {
      description: "Successful response",
      content: {
        "application/json": {
          schema: schemaReference,
        },
      },
    },
  };
}

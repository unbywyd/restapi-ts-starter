import { Service } from "typedi";
import {
  RequestLoginDTO,
  ResponseLoginDTO,
  RequestUserDTO,
  RequestVerifyCodeDTO,
  ResponseVerifyCodeDTO,
  ResponseMeDTO,
} from "./auth.dto";
import { plainToClass } from "class-transformer";
import { randomUUID } from "crypto";
import { IResponseError, SocketAuth, responseError, signIn } from "@base/utils/auth";
import { AuthSession } from "./auth.domain";
import { toDTO } from "@base/utils/common";
import { appConfig } from "@base/config/app";
import logger from "@base/utils/logger";
import { EventType } from "@base/utils/load-event-dispatcher";
import eventDispatcher from "event-dispatch";
import { User } from "@base/middlewares/auth/auth-check";

@Service()
export default class AuthService {
  constructor() { }
  socketConnect(socket: SocketAuth) {
    console.log("socket connected");
  }
  socketDisconnect(socket: SocketAuth) {
    console.log("socket disconnected");
  }
  async verifyCode(
    data: RequestVerifyCodeDTO
  ): Promise<ResponseVerifyCodeDTO | IResponseError> {
    try {
      const { token, code } = data;

      eventDispatcher.dispatch(EventType.onTest, {
        message: "Hello world",
      });

      const accessToken = await signIn<AuthSession>({
        id: "userId",
      });

      return toDTO(ResponseVerifyCodeDTO, {
        accessToken: accessToken,
        userId: code,
      });
    } catch (e) {
      return responseError(e.message);
    }
  }

  async updateUser(userId: User["id"], data: RequestUserDTO) {

    // Fix this
    return toDTO(ResponseMeDTO, data);
  }

  async login(
    data: RequestLoginDTO
  ): Promise<ResponseLoginDTO | IResponseError> {
    try {
      const { phoneNumber } = data;

      const code = Math.floor(100000 + Math.random() * 900000).toString();

      const token = randomUUID();

      logger.info(`Code for ${phoneNumber} is ${code}`);

      return toDTO(ResponseLoginDTO, {
        token,
      });
    } catch (e) {
      return responseError(e.message);
    }
  }
}

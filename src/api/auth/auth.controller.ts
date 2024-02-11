import {
  JsonController,
  Body,
  Post,
  Get,
  Patch,
} from "routing-controllers";
import { Service } from "typedi";
import { OpenAPI } from "routing-controllers-openapi";
import { ControllerBase } from "../../domain/abstracts/controller-base";
import {
  AuthGuard,
  CurrentSession,
  CurrentUser,
  User,
} from "@base/middlewares/auth/auth-check";
import {
  RequestLoginDTO,
  ResponseLoginDTO,
  ResponseMeDTO,
  RequestUserDTO,
  RequestVerifyCodeDTO,
  ResponseVerifyCodeDTO,
} from "./auth.dto";
import { ApiResponse, getOpenAPIResponse } from "@base/utils/auth";
import AuthService from "./auth.service";
import { AuthSession } from "./auth.domain";
import { toDTO } from "@base/utils/common";

@Service()
@OpenAPI({
  tags: ["Auth"],
})
@JsonController("/auth")
export class AuthController extends ControllerBase {
  public constructor(private authService: AuthService) {
    super();
  }

  @OpenAPI({
    summary: "User verify",
    description: "This route allows users to verify",
    responses: getOpenAPIResponse(ResponseVerifyCodeDTO),
  })
  @Post("/verify")
  public async verify(
    @Body() data: RequestVerifyCodeDTO
  ): Promise<ApiResponse<ResponseVerifyCodeDTO>> {
    return this.authService.verifyCode(data);
  }

  @OpenAPI({
    summary: "User login",
    description: "This route allows users to login",
    responses: getOpenAPIResponse(ResponseLoginDTO),
  })
  @Post("/login")
  public async login(
    @Body() data: RequestLoginDTO
  ): Promise<ApiResponse<ResponseLoginDTO>> {
    return this.authService.login(data);
  }

  @AuthGuard()
  @OpenAPI({
    summary: "User me",
    description: "This route allows users to get me",
    responses: getOpenAPIResponse(ResponseMeDTO),
  })
  @Get("/me")
  public async users(
    @CurrentUser() user: User,
    @CurrentSession() session: AuthSession
  ): Promise<ApiResponse<ResponseMeDTO>> {
    return toDTO(ResponseMeDTO, {
      ...user,
      ...session,
    });
  }

  @AuthGuard()
  @OpenAPI({
    summary: "Update user me",
    description: "Update current user",
    responses: getOpenAPIResponse(ResponseMeDTO),
  })
  @Patch("/me")
  public async updateMe(
    @Body() data: RequestUserDTO,
    @CurrentUser() user: User,
    @CurrentSession() session: AuthSession
  ) {
    const userId = user.id;
    const result = await this.authService.updateUser(userId, data);

    return toDTO(ResponseMeDTO, {
      ...user,
      ...session,
      ...result,
    });
  }
}

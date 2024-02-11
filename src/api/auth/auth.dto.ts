import { IsValidPhoneNumber } from "@base/utils/common";
import {
  IsNotEmpty,
  IsString,
  IsIn,
  IsInt,
  IsPositive,
  IsOptional,
  Max,
  Matches,
  Length,
  Min,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsDate,
} from "class-validator";
import { AuthSession } from "./auth.domain";
import { Exclude, Expose, Transform, Type } from "class-transformer";


export class RequestLoginDTO {
  @IsNotEmpty()
  @IsString()
  @IsValidPhoneNumber()
  phoneNumber: string;
}

export class ResponseVerifyCodeDTO {
  @IsNotEmpty()
  @IsString()
  @Expose()
  accessToken: string;

  @IsNotEmpty()
  @Expose()
  userId: string;
}

export class RequestVerifyCodeDTO {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{6}$/, { message: "code must contain only digits" })
  code: string;
}

export class ResponseLoginDTO {
  @IsNotEmpty()
  @IsString()
  @Expose()
  token: string;
}

export class LoginSendCodeTemplateDTO {
  @IsNotEmpty()
  @IsString()
  code: string;
  @IsNotEmpty()
  @IsString()
  token: string;
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;
}



export class RequestUserDTO {
  @IsOptional()
  @IsString()
  @Expose()
  name: string | null;

  @IsOptional()
  @Expose()
  @IsDate()
  @Type(() => Date)
  birthDate: Date;

  @IsOptional()
  @IsString()
  @Expose()
  email?: string;

  @IsOptional()
  @IsString()
  @Expose()
  idNumber?: string;
}

export class ResponseMeDTO {
  @IsNotEmpty()
  @IsString()
  @Expose()
  id: string;

  @IsNotEmpty()
  @IsString()
  @Expose()
  name: string;

  @IsDefined()
  @IsBoolean()
  @Expose()
  isActive: boolean;

  @IsNotEmpty()
  @IsString()
  @Expose()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @Expose()
  email?: string;

  @IsOptional()
  @IsString()
  @Expose()
  idNumber?: string;

  @IsOptional()
  @IsDate()
  @Expose()
  @Type(() => Date)
  createdAt: Date | null;

  @IsOptional()
  @IsDate()
  @Expose()
  @Type(() => Date)
  updatedAt: Date | null;
}

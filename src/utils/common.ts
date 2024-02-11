import { parsePhoneNumberFromString } from "libphonenumber-js";
import {
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
  ValidateNested,
} from "class-validator";
import { Transform, TransformOptions, Type, plainToClass } from "class-transformer";
import { createParamDecorator } from "routing-controllers";
import { JSONSchema } from "class-validator-jsonschema";

export function PhoneNumber(phoneNumber: string) {
  const result = parsePhoneNumberFromString(phoneNumber);
  return result.formatInternational();
}

export function IsValidPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    Transform((value: any) => {
      if (value.value == undefined) return null;
      const phoneNumber = parsePhoneNumberFromString(value.value);
      const result = phoneNumber
        ? phoneNumber.formatInternational()
        : value.value;

      return result;
    })(object, propertyName);

    registerDecorator({
      name: "isValidPhoneNumber",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return false;
          if ("string" !== typeof value) return false;
          const phoneNumber = parsePhoneNumberFromString(value);
          return phoneNumber ? phoneNumber.isValid() : false;
        },
        defaultMessage(args: ValidationArguments) {
          return "Phone number is not valid!";
        },
      },
    });
  };
}

export function isDate(str: string) {
  const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;

  return regex.test(str);
}

export function toSLug(str: string) {
  return str
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9_.]+/g, "_")
    .toUpperCase();
}

type Constructor<T> = new () => T;

export function toDTO<T>(DtoClass: Constructor<T>, data: any): T {
  return plainToClass(DtoClass, data, {
    excludeExtraneousValues: true,
  });
}

export function FixArrayJsonSchemaReference(reference: any): PropertyDecorator {
  return JSONSchema({
    items: {
      $ref: `#/components/schemas/${reference.name}`,
    },
  });
}

export function FixItemJsonSchemaReference(reference: any): PropertyDecorator {
  return JSONSchema({
    $ref: `#/components/schemas/${reference.name}`,
  });
}

export function ArrayItem(typeFunction: () => Function): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    ValidateNested({ each: true })(target, propertyKey);
    Type(typeFunction)(target, propertyKey);
    FixArrayJsonSchemaReference(typeFunction())(target, propertyKey);
  };
}

export function DTO(typeFunction: () => Function): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    ValidateNested()(target, propertyKey);
    Type(typeFunction)(target, propertyKey);
    FixItemJsonSchemaReference(typeFunction())(target, propertyKey);
  };
}


export function canStartRide(startDate: Date) {
  const now = new Date();
  const start = startDate;
  const sixHoursBeforeStart = new Date(start.getTime() - 6 * 60 * 60 * 1000);
  return now >= sixHoursBeforeStart;
}


export type TimestampObj = {
  timestamp: string;
}

export function findLatestObject(objects: Array<TimestampObj>) {
  if (!objects || objects.length === 0) {
    return null;
  }

  const sortedObjects = [...objects];

  sortedObjects.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return sortedObjects[0];
}

export function getDifferenceInMinutes(date1: Date, date2: Date): number {
  const differenceInMilliseconds: number = date2.getTime() - date1.getTime();

  const differenceInMinutes: number = differenceInMilliseconds / (1000 * 60);

  return Math.abs(differenceInMinutes);
}

export function getDifferenceInMinutesFromNow(date: Date): number {
  const now = new Date();

  return getDifferenceInMinutes(now, new Date(date));
}
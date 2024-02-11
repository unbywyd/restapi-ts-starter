import { SocketOutgoingEvent, SocketResponses } from './socket.domain';
// Будем экспортировать евенты для сокетов

import { OnMessage } from "socket-controllers";
import { AppSocket, SocketIncomingEvent } from "./socket.domain";
import { Socket } from "socket.io";

export function OnSocket(event: SocketIncomingEvent) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    OnMessage(event)(target, propertyName, descriptor);
  };
}

export function addAppSocketEmitter(socket: Socket): AppSocket {
  const extendedSocket: AppSocket = Object.assign(socket, {
    emitSuccess<T extends SocketOutgoingEvent>(
      event: T,
      data?: SocketResponses[T]
    ): void {
      socket.emit(event, {
        status: "ok",
        data: data || {},
      });
    },
    emitError<T extends SocketOutgoingEvent>(
      event: T,
      errors?: Array<string> | string
    ): void {
      socket.emit(event, {
        status: "error",
        errors:
          "string" === typeof errors ? [errors] : errors || ["Unknown error"],
      });
    },
  });

  return extendedSocket;
}
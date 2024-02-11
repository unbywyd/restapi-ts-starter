import { Socket } from "socket.io";

export enum SocketIncomingEvent {
  onMessage = "message",
}

export enum SocketOutgoingEvent {
  onMessage = "message",
  onError = "error",
}

export type SocketSuccessResponse<T> = {
  status: string;
  data?: T;
};

export type SocketErrorResponse = {
  status: string;
  errors?: Array<string>;
};

export type SocketResponse<T> = SocketSuccessResponse<T> | SocketErrorResponse;


export interface SocketPayloads {
  [SocketIncomingEvent.onMessage]: {
    message: string;
  }
}


export interface SocketResponses {
  [SocketOutgoingEvent.onMessage]: {
    message: string;
  }
  [SocketOutgoingEvent.onError]: {
    errors: Array<string>;
  }
}

export type SocketEventPayload<T extends SocketIncomingEvent> =
  SocketPayloads[T];

export type SocketEventResponse<T extends SocketOutgoingEvent> =
  SocketResponses[T];

export type AppSocket = Socket & {
  emitSuccess<T extends SocketOutgoingEvent>(
    event: T,
    data?: SocketResponses[T]
  ): void;
  emitError<T extends SocketOutgoingEvent>(
    event: T,
    errors?: Array<string> | string
  ): void;
};

import { SocketAuth } from "@base/utils/auth";
import {
  ConnectedSocket,
  MessageBody,
  OnConnect,
  OnDisconnect,
  OnMessage,
  SocketController,
} from "socket-controllers";
import { Service } from "typedi";
import {
  SocketIncomingEvent,
  SocketOutgoingEvent,
  SocketPayloads,
} from "@base/utils/socket.domain";
import { OnSocket } from "@base/utils/socket.utils";
import AuthService from './auth.service';

@SocketController()
@Service()
export class MessageController {
  constructor(private service: AuthService) { }
  @OnConnect()
  connection(@ConnectedSocket() socket: SocketAuth) {
    this.service.socketConnect(socket);
  }

  @OnDisconnect()
  disconnect(@ConnectedSocket() socket: SocketAuth) {
    this.service.socketDisconnect(socket);
  }

  @OnSocket(SocketIncomingEvent.onMessage)
  async save(
    @ConnectedSocket() socket: SocketAuth,
    @MessageBody()
    message: SocketPayloads[SocketIncomingEvent.onMessage]
  ) {
    try {
      socket.emitSuccess(SocketOutgoingEvent.onMessage, {
        message: message.message
      });
    } catch (e) {
      socket.emitError(SocketOutgoingEvent.onError, e.message);
      console.log(e);
    }
  }
}

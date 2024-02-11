import { EventPayloads, EventType, Listener } from "@base/utils/load-event-dispatcher";
import { EventSubscriber } from "event-dispatch";


@EventSubscriber()
export class AuthEvents {
  @Listener(EventType.onTest)
  public async onTestMessage(
    payload: EventPayloads[EventType.onTest]
  ) {
    console.log("onTestMessage", payload.message);
  }
}

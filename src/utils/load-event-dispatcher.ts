import { glob } from "glob";
import { appConfig } from "@base/config/app";
import path from "path";
import { EventDispatcher, On } from "event-dispatch";

/**
 * This loads all the created subscribers into the project, so we do not have to import them manually.
 */
export async function loadEventDispatcher() {
  const patterns = appConfig.appPath + appConfig.eventsDir;
  const fiels = await glob(patterns, {
    cwd: appConfig.appPath,
  });
  fiels.forEach((file) => {
    const absolutePath = path.isAbsolute(file)
      ? file
      : path.join(appConfig.appPath, file);
    require(absolutePath).default;
  });
}

const _eventDispatcher = new EventDispatcher();

export enum EventType {
  onTest = "onTest",
}

export interface EventPayloads {
  [EventType.onTest]: {
    message: string;
  };
}

class CustomEventDispatcher {
  dispatch<K extends keyof EventPayloads>(
    eventType: K,
    payload: EventPayloads[K]
  ) {
    _eventDispatcher.dispatch(eventType, payload);
  }
}


export function Listener<K extends EventType>(eventType: K) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = function (arg: EventPayloads[K]) {
      return method.apply(this, [arg]);
    };

    On(eventType)(target, propertyKey, descriptor);
  };
}

const eventDispatcher = new CustomEventDispatcher();

export default eventDispatcher;

import { EventDispatcher as EventDispatcherClass } from "event-dispatch";
import { Container } from "typedi";

export const singletonEventDispatcher: EventDispatcherClass | null =
  new EventDispatcherClass();

export function EventDispatcher(): any {
  return (object: any, propertyName: string, index?: number): any => {
    Container.registerHandler({
      object,
      propertyName,
      index,
      value: () => singletonEventDispatcher,
    });
  };
}

export { EventDispatcher as EventDispatcherInterface } from "event-dispatch";

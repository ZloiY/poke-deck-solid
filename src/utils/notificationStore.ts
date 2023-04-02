import { createMemo, createSignal } from "solid-js";

const messageMap = new Map<string, Message>();

const [notifiactionsMap, setNotificationsMap] = createSignal(messageMap, { equals: false });

const pushNewNotification = (message: Message) => {
  setNotificationsMap((notifiactionsMap) => {
    notifiactionsMap.set(message.id, message)
    return notifiactionsMap;
  }); 
};

const removeNotification = (message: Message) => {
  setNotificationsMap((notifiactionsMap) => {
    notifiactionsMap.delete(message.id);
    return notifiactionsMap;
  });
};

const notifications = createMemo(() => [...notifiactionsMap().values()])

export { pushNewNotification, removeNotification, notifications };

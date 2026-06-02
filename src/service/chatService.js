import {
  ref,
  onChildAdded,
  off,
} from "firebase/database";

import { realtimeDb } from "../firebase";

export const listenMessages = (
  workItemId,
  callback
) => {

  if (!workItemId) return () => {};

  const chatRef = ref(
    realtimeDb,
    `work_item_chat/${workItemId}`
  );

  console.log(
    "🎯 Listening Path:",
    `work_item_chat/${workItemId}`
  );

  onChildAdded(
    chatRef,
    (snapshot) => {

      console.log(
        "🔥 Firebase Key:",
        snapshot.key
      );

      console.log(
        "🔥 Firebase Raw Data:",
        snapshot.val()
      );

      if (!snapshot.exists()) return;

      const message = {
        firebaseKey: snapshot.key,
        ...snapshot.val(),
      };

      console.log(
        "🔥 Firebase Final Message:",
        message
      );

      callback(message);
    }
  );

  return () => {
    off(chatRef);
  };
};
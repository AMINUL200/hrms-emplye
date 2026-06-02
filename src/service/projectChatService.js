import {
  ref,
  onChildAdded,
  off,
} from "firebase/database";

import { realtimeDb } from "../firebase";

export const listenProjectMessages = (
  projectId,
  callback
) => {

  if (!projectId) return () => {};

  const chatRef = ref(
    realtimeDb,
    `project_chat/${projectId}`
  );

  onChildAdded(chatRef, (snapshot) => {

    if (!snapshot.exists()) return;

    console.log(
      "🔥 Project Message:",
      snapshot.val()
    );

    callback({
      firebaseKey: snapshot.key,
      ...snapshot.val(),
    });

  });

  return () => {
    off(chatRef);
  };
};
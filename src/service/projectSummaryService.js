import {
  ref,
  onValue,
  off,
} from "firebase/database";

import { realtimeDb } from "../firebase";

/**
 * Listen all project summaries.
 *
 * Firebase Structure:
 *
 * project_summary
 *    40
 *      project_id
 *      last_message
 *      last_sender
 *      last_message_time
 *
 *    41
 *      ...
 */

export const listenProjectSummary = (callback) => {
  const summaryRef = ref(
    realtimeDb,
    "project_summary"
  );

  const unsubscribe = onValue(summaryRef, (snapshot) => {
    if (!snapshot.exists()) return;

    const summaries = snapshot.val();

    console.log(
      "📋 Project Summary Updated",
      summaries
    );

    callback(summaries);
  });

  return () => {
    unsubscribe();
    off(summaryRef);
  };
};
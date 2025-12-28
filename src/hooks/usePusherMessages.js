import { useEffect } from "react";
import Pusher from "pusher-js";

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;

console.log("PUSHER_KEY:", PUSHER_KEY);
console.log("PUSHER_CLUSTER:", PUSHER_CLUSTER);

export default function useProjectChatPusher(emid, projectId, onMessage) {
  useEffect(() => {
    if (!emid || !projectId) return;
    const pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      forceTLS: true,
    });

    // Example: personal notifications
    const channelName = `project-channel.${emid}.${projectId}`;

    console.log("Subscribing to channel:", channelName);

    const channel = pusher.subscribe(channelName);

     channel.bind("project-post-live", (data) => {
      console.log("💬 Live project message:", data);

       // Extract the message from the data structure
      const messageData = data.post || data;
      console.log("📨 Extracted message:", messageData);

      onMessage && onMessage(messageData);
    });

    return () => {
       pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [emid, projectId, onMessage]);
}

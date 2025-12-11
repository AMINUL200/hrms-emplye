import { useEffect } from "react";
import Pusher from "pusher-js";

export default function useNoticeListener(emid, employeeId, onMessage) {
  useEffect(() => {
    if (!emid || !employeeId) return;

    const pusher = new Pusher("b5df271c0c008d8a6b60", {
      cluster: "ap2",
      forceTLS: true,
    });

    // load ringtone from localStorage
    let ringtoneFile =
      localStorage.getItem("selectedRingtone") ||
      "/public/sounds/Doraemon Notification Ringtone Download - MobCup.Com.Co.mp3";

    const playSound = () => {
      const audio = new Audio(ringtoneFile);
      audio.volume = 1;
      audio.play();
    };

    // Channel for organization-wide notifications
    const orgChannel = `notice-channel.${emid}.all`;
    const chOrg = pusher.subscribe(orgChannel);

    chOrg.bind("notice-live", (data) => {
      playSound();
      console.log("ORG Notification:", data.notification);
      onMessage && onMessage(data.notification);
    });

    // Channel for personal notifications
    const empChannel = `notice-channel.${emid}.${employeeId}`;
    const chEmp = pusher.subscribe(empChannel);

    chEmp.bind("notice-live", (data) => {
      console.log("EMP Notification:", data.notification);
      onMessage && onMessage(data.notification);
    });

    return () => {
      pusher.unsubscribe(orgChannel);
      pusher.unsubscribe(empChannel);
      pusher.disconnect();
    };
  }, [emid, employeeId]);
}

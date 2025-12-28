import { useEffect, useRef } from "react";
import Pusher from "pusher-js";

export default function useNoticeListener(emid, employeeId, onMessage) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!emid || !employeeId) return;

    // Initialize reusable audio object
    audioRef.current = new Audio();
    audioRef.current.volume = 1;

    const playSound = () => {
      const ringtone =
        localStorage.getItem("selectedRingtone") ||
        "/public/sounds/Doraemon Notification Ringtone Download - MobCup.Com.Co.mp3";

      audioRef.current.src = ringtone;
      audioRef.current.currentTime = 0;

      audioRef.current
        .play()
        .catch((err) => console.warn("Audio play blocked:", err));
    };

    const pusher = new Pusher("e438242d1567e1f86539", {
      cluster: "eu",
      forceTLS: true,
    });

    // ORG channel
    const orgChannel = `notice-channel.${emid}.all`;
    const chOrg = pusher.subscribe(orgChannel);

    chOrg.bind("notice-live", (data) => {
      playSound();
      onMessage?.(data.notification);
    });

    // EMP channel
    const empChannel = `notice-channel.${emid}.${employeeId}`;
    const chEmp = pusher.subscribe(empChannel);

    chEmp.bind("notice-live", (data) => {
      playSound();
      onMessage?.(data.notification);
    });

    return () => {
      pusher.unsubscribe(orgChannel);
      pusher.unsubscribe(empChannel);
      pusher.disconnect();
    };
  }, [emid, employeeId, onMessage]);
}

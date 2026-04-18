import { useEffect, useRef } from "react";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";

export default function useNoticeListener(emid, employeeId, onMessage) {
  const audioRef = useRef(null);
  const processedIds = useRef(new Set());
  const initialLoadComplete = useRef(false);

  useEffect(() => {
    if (!emid || !employeeId) return;

    audioRef.current = new Audio("/sounds/notification.mp3");

    const playSound = () => {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    };

    const q = query(
      collection(db, "notifications"),
      where("emid", "==", emid),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Skip initial load
      if (!initialLoadComplete.current) {
        initialLoadComplete.current = true;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = {
            id: change.doc.id,
            ...change.doc.data(),
          };

          // Skip duplicate
          if (processedIds.current.has(data.id)) return;

          console.log("✅ NEW NOTIFICATION:", data);

          if (data.target === "all" || data.employeeId === employeeId) {
            playSound();
            onMessage?.(data);
            processedIds.current.add(data.id);
          }
        }
      });
    });

    return () => unsubscribe();
  }, [emid, employeeId, onMessage]);
}
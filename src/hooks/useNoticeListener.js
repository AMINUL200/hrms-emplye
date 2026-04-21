import { useEffect, useRef } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";

export default function useNoticeListener(emid, employeeId, onMessage) {
  const audioRef = useRef(null);
  const processedIds = useRef(new Set());
  const initialLoadComplete = useRef(false);

  useEffect(() => {
    if (!emid || !employeeId) return;

    console.log("🚀 Listener start:", emid, employeeId); // ✅ ADD HERE

    audioRef.current = new Audio("/sounds/notification.mp3");

    const playSound = () => {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    };

    const q = query(
      collection(db, "notifications"),
      where("emid", "==", emid),
      orderBy("createdAt", "desc"),
      limit(20),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // ✅ ADD THESE LOGS HERE
      console.log("📦 Snapshot size:", snapshot.size);
      console.log("🔄 Changes:", snapshot.docChanges());

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = {
            id: change.doc.id,
            ...change.doc.data(),
          };

          console.log("👉 Incoming data:", data); // ✅ DEBUG

          if (processedIds.current.has(data.id)) return;

          if (!initialLoadComplete.current) {
            processedIds.current.add(data.id);
            return;
          }

          console.log("✅ NEW NOTIFICATION:", data);

          if (data.target === "all" || data.employeeId === employeeId) {
            playSound();
            onMessage?.(data);
            processedIds.current.add(data.id);
          }
        }
      });

      initialLoadComplete.current = true;
    });

    return () => unsubscribe();
  }, [emid, employeeId, onMessage]);
}

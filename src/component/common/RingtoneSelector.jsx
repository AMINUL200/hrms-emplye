import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./RingtoneSelector.css";

const ringtones = [
  { name: "Default", file: "/public/sounds/Doraemon Notification Ringtone Download - MobCup.Com.Co.mp3" },
  { name: "Ding Dong", file: "/public/sounds/hangout-message-ringtones-mobcup-58196.mp3" },
  { name: "Bell", file: "/public/sounds/iphone-original-tune-28179.mp3" },
  { name: "Alert", file: "/public/sounds/LINE_Ding_Dong_Notification-646955-mobiles24.mp3" },
];

const RingtoneSelector = ({ disabled = false }) => {
  const [tone, setTone] = useState("");

  useEffect(() => {
    const savedTone = localStorage.getItem("selectedRingtone");
    if (savedTone) setTone(savedTone);
    else setTone(ringtones[0].file);
  }, []);

  const saveTone = () => {
    if (disabled) return;
    localStorage.setItem("selectedRingtone", tone);
    toast.success("Ringtone saved!");
  };

  const previewSound = () => {
    if (disabled) return;
    const audio = new Audio(tone);
    audio.play();
  };

  return (
    <div className={`ringtone-selector ${disabled ? "disabled" : ""}`}>
      <h4>Notification Ringtone</h4>
      <div className="ringtone-select-wrapper">
        <select value={tone} onChange={(e) => setTone(e.target.value)} disabled={disabled}>
          {ringtones.map((r) => (
            <option key={r.file} value={r.file}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <div className="ringtone-actions">
        <button className="btn-preview" onClick={previewSound}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Play
        </button>
        <button className="btn-save" onClick={saveTone}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          Save
        </button>
      </div>
    </div>
  );
};

export default RingtoneSelector;
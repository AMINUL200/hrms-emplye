import { faPlay, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ringtones = [
  {
    name: "Default",
    file: "/public/sounds/Doraemon Notification Ringtone Download - MobCup.Com.Co.mp3",
  },
  {
    name: "Ding Dong",
    file: "/public/sounds/hangout-message-ringtones-mobcup-58196.mp3",
  },
  { name: "Bell", file: "/public/sounds/iphone-original-tune-28179.mp3" },
  {
    name: "Alert",
    file: "/public/sounds/LINE_Ding_Dong_Notification-646955-mobiles24.mp3",
  },
];

const RingtoneSelector = () => {
  const [tone, setTone] = useState("");

  // Load saved tone
  useEffect(() => {
    const savedTone = localStorage.getItem("selectedRingtone");
    if (savedTone) setTone(savedTone);
    else setTone(ringtones[0].file);
  }, []);

  const saveTone = () => {
    localStorage.setItem("selectedRingtone", tone);
    toast.success("Ringtone saved!");
  };

  const previewSound = () => {
    const audio = new Audio(tone);
    audio.play();
  };

  return (
    <div className="ringtone-box">
      <h2 className="ringtone-title">Select Notification Ringtone</h2>

      {/* Custom Dropdown */}
      <div className="select-wrapper">
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="ringtone-select"
        >
          {ringtones.map((r) => (
            <option key={r.file} value={r.file}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="ringtone-actions">
        <button className="preview-btn" onClick={previewSound}>
          <FontAwesomeIcon icon={faPlay} /> Preview
        </button>

        <button className="save-btn" onClick={saveTone}>
          <FontAwesomeIcon icon={faSave} /> Save
        </button>
      </div>
    </div>
  );
};

export default RingtoneSelector;

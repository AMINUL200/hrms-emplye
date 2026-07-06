import React, { useContext } from "react";
import "./GreetingHeader.css";
import { AuthContext } from "../../context/AuthContex";

const getGreeting = (hour) => {
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

const GreetingHeader = () => {
  const { data } = useContext(AuthContext) || {};
  const now = new Date();

  const greeting = getGreeting(now.getHours());
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="gh-wrap">
      <p className="gh-greeting">
        {greeting}, <span className="gh-wave">👋</span>
      </p>
      <h1 className="gh-name">{data?.name || "Employee"}</h1>
      <p className="gh-datetime">
        {dateStr} <span className="gh-dot">•</span> {timeStr}
      </p>
    </div>
  );
};

export default GreetingHeader;
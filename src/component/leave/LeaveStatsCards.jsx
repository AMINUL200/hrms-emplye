import React from "react";
import "./LeaveStatsCards.css";
import { ShoppingBag, Hourglass, CheckCircle2, XCircle, CalendarDays } from "lucide-react";

const STATS = [
  {
    key: "total",
    label: "Total Leaves",
    labelClass: "lsc-label--default",
    value: 18,
    sub: "This Year",
    cardClass: "",
    iconBg: "lsc-icon--blue",
    icon: ShoppingBag,
  },
  {
    key: "pending",
    label: "Pending",
    labelClass: "lsc-label--pending",
    value: 6,
    sub: "Requires Action",
    cardClass: "lsc-card--pending",
    iconBg: "lsc-icon--orange",
    icon: Hourglass,
  },
  {
    key: "approved",
    label: "Approved",
    labelClass: "lsc-label--approved",
    value: 10,
    sub: "This Year",
    cardClass: "",
    iconBg: "lsc-icon--green",
    icon: CheckCircle2,
  },
  {
    key: "rejected",
    label: "Rejected",
    labelClass: "lsc-label--rejected",
    value: 2,
    sub: "This Year",
    cardClass: "lsc-card--rejected",
    iconBg: "lsc-icon--red",
    icon: XCircle,
  },
  {
    key: "remaining",
    label: "Remaining Balance",
    labelClass: "lsc-label--default",
    value: 14,
    sub: "Days Left",
    cardClass: "",
    iconBg: "lsc-icon--purple",
    icon: CalendarDays,
  },
];

const LeaveStatsCards = () => {
  return (
    <div className="lsc-row">
      {STATS.map(({ key, label, labelClass, value, sub, cardClass, iconBg, icon: Icon }) => (
        <div className={`lsc-card ${cardClass}`} key={key}>
          <div className="lsc-card-top">
            <span className={`lsc-label ${labelClass}`}>{label}</span>
            <span className={`lsc-icon ${iconBg}`}>
              <Icon size={18} />
            </span>
          </div>
          <div className="lsc-value">{value}</div>
          <div className="lsc-sub">{sub}</div>
        </div>
      ))}
    </div>
  );
};

export default LeaveStatsCards;
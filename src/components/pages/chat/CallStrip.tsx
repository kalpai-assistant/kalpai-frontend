import React from "react";
import { FaPhone } from "react-icons/fa";

interface CallStripProps {
  label: string;
  time?: string;
}

const CallStrip: React.FC<CallStripProps> = ({ label, time }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "#f3f6ff",
        border: "1px solid #dbe4ff",
        color: "#2f3b52",
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: 12,
      }}
      title={time ? `${time} • ${label}` : label}
    >
      <FaPhone />
      <span>{label}</span>
    </div>
  );
};

export default CallStrip;

import React, { useState } from "react";
import "./ProjectDiscussion.css";
import { Send, Paperclip, Smile } from "lucide-react";

const COMMENTS = [
  {
    id: 1,
    author: "John Doe",
    initials: "JD",
    color: "#7c3aed",
    time: "2 hours ago",
    text: "I've pushed the initial wireframes for the homepage to the Files tab. Let me know your thoughts before Friday's review.",
  },
  {
    id: 2,
    author: "Jane Smith",
    initials: "JS",
    color: "#2563eb",
    time: "1 hour ago",
    text: "Looks great! Can we make the hero section a bit more compact on mobile? Also loved the new color palette.",
  },
  {
    id: 3,
    author: "Mike Johnson",
    initials: "MJ",
    color: "#0f172a",
    time: "45 minutes ago",
    text: "Agreed with Jane. I'll adjust the breakpoints and share an updated version by tomorrow morning.",
  },
  {
    id: 4,
    author: "Sarah Wilson",
    initials: "SW",
    color: "#16a34a",
    time: "10 minutes ago",
    text: "Quick update — QA test plan draft is ready for review, added it under Files as well.",
  },
];

const ProjectDiscussion = () => {
  const [message, setMessage] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    setMessage("");
  };

  return (
    <div className="pd-card">
      <div className="pd-header">
        <h3>Discussions</h3>
        <span className="pd-count-badge">{COMMENTS.length}</span>
      </div>

      <div className="pd-thread">
        {COMMENTS.map((c) => (
          <div className="pd-comment" key={c.id}>
            <span className="pd-avatar" style={{ background: c.color }}>
              {c.initials}
            </span>
            <div className="pd-comment-body">
              <div className="pd-comment-meta">
                <span className="pd-comment-author">{c.author}</span>
                <span className="pd-comment-time">{c.time}</span>
              </div>
              <p className="pd-comment-text">{c.text}</p>
            </div>
          </div>
        ))}
      </div>

      <form className="pd-composer" onSubmit={handleSend}>
        <button type="button" className="pd-composer-icon-btn" aria-label="Attach file">
          <Paperclip size={16} />
        </button>
        <input
          type="text"
          className="pd-composer-input"
          placeholder="Write a comment..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="button" className="pd-composer-icon-btn" aria-label="Add emoji">
          <Smile size={16} />
        </button>
        <button type="submit" className="pd-send-btn" disabled={!message.trim()}>
          <Send size={14} />
          Send
        </button>
      </form>
    </div>
  );
};

export default ProjectDiscussion;
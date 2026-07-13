import React, { useState, useRef, useEffect } from "react";
import "./WorkspaceDiscussion.css";
import {
  Paperclip,
  Send,
  Reply,
  X,
  FileText,
  Download,
  MessageSquare,
} from "lucide-react";

const CURRENT_USER = { id: "me", name: "SK Shamim", initials: "SS", color: "#7c3aed" };

const PARTICIPANTS = {
  tanvir: { id: "tanvir", name: "Tanvir Hasan", initials: "TH", color: "#2563eb" },
  rafia: { id: "rafia", name: "Rafia Sultana", initials: "RS", color: "#16a34a" },
  jakaria: { id: "jakaria", name: "Jakaria Ahmed", initials: "JA", color: "#0f172a" },
};

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: PARTICIPANTS.tanvir,
    isMe: false,
    time: "10:12 AM",
    text: "Pushed the API changes for the login flow, can someone review before EOD?",
  },
  {
    id: 2,
    sender: PARTICIPANTS.rafia,
    isMe: false,
    time: "10:20 AM",
    text: "Here's the updated homepage mockup for review 👇",
    image:
      "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=500&q=60",
  },
  {
    id: 3,
    sender: CURRENT_USER,
    isMe: true,
    time: "10:24 AM",
    replyTo: { id: 1, senderName: "Tanvir Hasan", snippet: "Pushed the API changes for the login flow..." },
    text: "On it, will review in the next hour and share comments here.",
  },
  {
    id: 4,
    sender: PARTICIPANTS.jakaria,
    isMe: false,
    time: "11:02 AM",
    text: "Sharing the QA checklist for this sprint.",
    file: { name: "QA_Checklist_Sprint4.pdf", size: "482 KB" },
  },
  {
    id: 5,
    sender: CURRENT_USER,
    isMe: true,
    time: "11:15 AM",
    replyTo: { id: 2, senderName: "Rafia Sultana", snippet: "Photo" },
    text: "Loving the new hero section, can we try a slightly darker overlay?",
  },
];

const WorkspaceDiscussion = () => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [attachment, setAttachment] = useState(null); // { type: 'image'|'file', file, previewUrl? }

  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFilePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      setAttachment({ type: "image", file, previewUrl: URL.createObjectURL(file) });
    } else {
      setAttachment({ type: "file", file });
    }
    e.target.value = "";
  };

  const clearAttachment = () => setAttachment(null);

  const handleReplyClick = (msg) => {
    setReplyingTo({
      id: msg.id,
      senderName: msg.isMe ? "You" : msg.sender.name,
      snippet: msg.text || (msg.image ? "Photo" : msg.file ? msg.file.name : ""),
    });
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() && !attachment) return;

    const newMessage = {
      id: Date.now(),
      sender: CURRENT_USER,
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: input.trim(),
      replyTo: replyingTo || undefined,
      image: attachment?.type === "image" ? attachment.previewUrl : undefined,
      file:
        attachment?.type === "file"
          ? { name: attachment.file.name, size: `${(attachment.file.size / 1024).toFixed(0)} KB` }
          : undefined,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setReplyingTo(null);
    setAttachment(null);
  };

  return (
    <div className="wd-card">
      <div className="wd-header">
        <span className="wd-header-icon">
          <MessageSquare size={16} />
        </span>
        <h3>Discussion</h3>
        <span className="wd-count-badge">{messages.length}</span>
      </div>

      {/* Message list */}
      <div className="wd-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`wd-message-row ${msg.isMe ? "wd-message-row--me" : ""}`}>
            {!msg.isMe && (
              <span className="wd-avatar" style={{ background: msg.sender.color }}>
                {msg.sender.initials}
              </span>
            )}

            <div className="wd-bubble-col">
              {!msg.isMe && <span className="wd-sender-name">{msg.sender.name}</span>}

              <div className={`wd-bubble ${msg.isMe ? "wd-bubble--me" : "wd-bubble--other"}`}>
                {msg.replyTo && (
                  <div className="wd-reply-quote">
                    <span className="wd-reply-quote-name">{msg.replyTo.senderName}</span>
                    <span className="wd-reply-quote-snippet">{msg.replyTo.snippet}</span>
                  </div>
                )}

                {msg.image && (
                  <img src={msg.image} alt="Shared attachment" className="wd-image-preview" />
                )}

                {msg.file && (
                  <div className="wd-file-chip">
                    <span className="wd-file-icon">
                      <FileText size={16} />
                    </span>
                    <div className="wd-file-info">
                      <span className="wd-file-name">{msg.file.name}</span>
                      <span className="wd-file-size">{msg.file.size}</span>
                    </div>
                    <button type="button" className="wd-file-download" aria-label="Download">
                      <Download size={14} />
                    </button>
                  </div>
                )}

                {msg.text && <p className="wd-bubble-text">{msg.text}</p>}

                <span className="wd-bubble-time">{msg.time}</span>
              </div>

              <button
                type="button"
                className="wd-reply-btn"
                onClick={() => handleReplyClick(msg)}
              >
                <Reply size={12} />
                Reply
              </button>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form className="wd-composer" onSubmit={handleSend}>
        {replyingTo && (
          <div className="wd-composer-reply-preview">
            <div className="wd-composer-reply-text">
              <span className="wd-composer-reply-name">Replying to {replyingTo.senderName}</span>
              <span className="wd-composer-reply-snippet">{replyingTo.snippet}</span>
            </div>
            <button
              type="button"
              className="wd-composer-reply-close"
              onClick={() => setReplyingTo(null)}
              aria-label="Cancel reply"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {attachment && (
          <div className="wd-composer-attachment-preview">
            {attachment.type === "image" ? (
              <img src={attachment.previewUrl} alt="Attachment preview" />
            ) : (
              <div className="wd-composer-file-chip">
                <FileText size={15} />
                <span>{attachment.file.name}</span>
              </div>
            )}
            <button
              type="button"
              className="wd-composer-attachment-remove"
              onClick={clearAttachment}
              aria-label="Remove attachment"
            >
              <X size={13} />
            </button>
          </div>
        )}

        <div className="wd-composer-row">
          <button
            type="button"
            className="wd-composer-icon-btn"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach file"
          >
            <Paperclip size={17} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="wd-hidden-file-input"
            onChange={handleFilePick}
            accept="image/*,.pdf,.doc,.docx,.zip,.xlsx"
          />

          <input
            type="text"
            className="wd-composer-input"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button
            type="submit"
            className="wd-send-btn"
            disabled={!input.trim() && !attachment}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkspaceDiscussion;
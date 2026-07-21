import React, { memo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faReply,
  faEllipsisV,
  faTrashAlt,
  faCheck,
  faDownload,
  faFile,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileArchive,
  faImage,
} from "@fortawesome/free-solid-svg-icons";

// ========================================
// HELPER FUNCTIONS
// ========================================

const getFileIcon = (filename) => {
  if (!filename) return faFile;
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return faFilePdf;
  if (ext === "doc" || ext === "docx") return faFileWord;
  if (ext === "xls" || ext === "xlsx") return faFileExcel;
  if (ext === "zip" || ext === "rar" || ext === "7z") return faFileArchive;
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return faImage;
  return faFile;
};

const formatWhatsAppTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date >= today) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (date >= yesterday) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
};

// ========================================
// COMPONENT
// ========================================

const MessageBubble = memo(
  ({
    comment,
    onReply,
    onDelete,
    currentUserId,
    STORAGE_URL,
    employeeName,
    employeeId,
  }) => {
    const isOwnMessage = comment.employee_id === currentUserId;
    const [showMenu, setShowMenu] = useState(false);

    return (
      <div
        className={`message-wrapper ${isOwnMessage ? "message-own" : "message-other"}`}
      >
        {/* Avatar for other people's messages */}
        {!isOwnMessage && (
          <div className="message-avatar">
            {comment.user?.name?.charAt(0) ||
              comment.employee_id?.charAt(0) ||
              "U"}
          </div>
        )}

        <div className="message-bubble-container">
          {/* Sender name (only for others) */}
          {!isOwnMessage && (
            <div className="message-sender-name">
              {comment.user?.name || comment.employee_id}
              {/* {comment.employee_role && (
                <span
                  className={`sender-role role-${comment.employee_role.role_name?.toLowerCase()}`}
                >
                  {comment.employee_role.role_name}
                </span>
              )} */}
            </div>
          )}

          <div
            className={`message-bubble ${isOwnMessage ? "bubble-own" : "bubble-other"}`}
          >
            {/* Reply context */}
            {comment.reply_to_comment && (
              <div className="message-reply-context">
                <div className="reply-context-bar" />
                <div className="reply-context-body">
                  <span className="reply-context-user">
                    {comment.reply_to_comment.user}
                  </span>
                  <span className="reply-context-text">
                    {comment.reply_to_comment.comment?.substring(0, 80)}
                    {comment.reply_to_comment.comment?.length > 80 ? "..." : ""}
                  </span>
                </div>
              </div>
            )}

            {/* Message text */}
            {comment.comment && (
              <div className="message-text">{comment.comment}</div>
            )}

            {/* File attachment */}
            {comment.file && (
              <a
                href={`${STORAGE_URL}${comment.file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="message-attachment"
              >
                <FontAwesomeIcon icon={getFileIcon(comment.file)} />
                <span>View Attachment</span>
                <FontAwesomeIcon icon={faDownload} />
              </a>
            )}

            {/* Time + read status */}
            <div className="message-meta">
              <span className="message-time">
                {formatWhatsAppTime(comment.created_at)}
              </span>
              {isOwnMessage && (
                <span className="message-status">
                  <FontAwesomeIcon icon={faCheck} />
                </span>
              )}
            </div>
          </div>

          {/* Hover actions */}
          <div
            className={`message-actions ${isOwnMessage ? "actions-own" : "actions-other"}`}
          >
            <button
              className="message-action-btn reply-action"
              onClick={() => onReply(comment)}
              title="Reply"
            >
              <FontAwesomeIcon icon={faReply} />
            </button>
            {isOwnMessage && (
              <div className="message-menu-container">
                <button
                  className="message-action-btn menu-action"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <FontAwesomeIcon icon={faEllipsisV} />
                </button>
                {showMenu && (
                  <div className="message-menu-dropdown">
                    <button
                      onClick={() => {
                        onDelete(comment.id);
                        setShowMenu(false);
                      }}
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Avatar for own messages */}
        {isOwnMessage && (
          <div className="message-avatar message-avatar-own">
            {employeeName?.charAt(0) || employeeId?.charAt(0) || "U"}
          </div>
        )}
      </div>
    );
  }
);

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;
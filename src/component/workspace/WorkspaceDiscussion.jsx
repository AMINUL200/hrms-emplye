import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComment,
  faSmile,
  faPaperclip,
  faPaperPlane,
  faSpinner,
  faTimes,
  faClock,
  faReply,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import axios from "axios";
// import { listenMessages } from "../../../service/chatService";
// import MessageBubble from "./MessageBubble";
import "./WorkspaceDiscussion.css";
import { listenMessages } from "../../service/chatService";
import MessageBubble from "../../pages/employee/project/MessageBubble";

// ========================================
// HELPER FUNCTIONS
// ========================================

const sortCommentsByDate = (commentsList) => {
  return [...commentsList].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
};

const groupCommentsByDate = (commentsList) => {
  const groups = {};
  commentsList.forEach((comment) => {
    const date = new Date(comment.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateKey;
    if (date.toDateString() === today.toDateString()) {
      dateKey = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = "Yesterday";
    } else {
      dateKey = date.toLocaleDateString([], {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(comment);
  });
  return groups;
};

const WorkspaceDiscussion = ({
  api_url,
  token,
  projectId,
  workItemId,
  STORAGE_URL,
  currentUserId,
  employeeName,
  employeeId,
}) => {
  // ========================================
  // STATE
  // ========================================

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newCommentFile, setNewCommentFile] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  // ========================================
  // REFS
  // ========================================

  const messagesEndRef = useRef(null);
  const replyInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // ========================================
  // EMOJIS
  // ========================================

  const emojis = [
    "😊",
    "😂",
    "❤️",
    "👍",
    "🎉",
    "🔥",
    "👏",
    "🙏",
    "😢",
    "😡",
    "🤔",
    "💯",
  ];

  // ========================================
  // SCROLL TO BOTTOM
  // ========================================

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, []);

  // ========================================
  // FETCH COMMENTS
  // ========================================

  const fetchComments = useCallback(async () => {
    if (!workItemId || !projectId) return;
    try {
      setCommentsLoading(true);
      const response = await axios.get(
        `${api_url}/work-item-comment/${projectId}/${workItemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status === 1) {
        setComments(response.data.data || []);
        setTimeout(scrollToBottom, 100);
      } else {
        toast.error(response.data.message || "Failed to load comments");
        setComments([]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setCommentsLoading(false);
    }
  }, [api_url, token, projectId, workItemId, scrollToBottom]);

  // ========================================
  // SUBMIT COMMENT
  // ========================================

  const handleSubmitComment = async () => {
    if (!newComment.trim() && !newCommentFile) {
      toast.error("Please enter a message or attach a file");
      return;
    }
    try {
      setSubmittingComment(true);
      const formData = new FormData();
      formData.append("project_id", projectId);
      formData.append("work_item_id", workItemId);
      formData.append("comment", newComment.trim());
      if (replyTo) formData.append("parent_comment_id", replyTo.id);
      if (newCommentFile) formData.append("file", newCommentFile);

      const response = await axios.post(
        `${api_url}/work-item-comment/store`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === 1) {
        toast.success(replyTo ? "Reply sent!" : "Message sent!");
        setNewComment("");
        setNewCommentFile(null);
        setReplyTo(null);
        setShowEmojiPicker(false);
        await fetchComments();
        requestAnimationFrame(() => scrollToBottom());
      } else {
        toast.error(response.data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to send message");
    } finally {
      setSubmittingComment(false);
    }
  };

  // ========================================
  // DELETE COMMENT
  // ========================================

  const handleDeleteComment = useCallback(
    async (commentId) => {
      if (!window.confirm("Are you sure you want to delete this message?"))
        return;
      try {
        setDeletingCommentId(commentId);
        const response = await axios.delete(
          `${api_url}/work-item-comment/delete/${commentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.status === 1) {
          toast.success("Message deleted!");
          await fetchComments();
        } else {
          toast.error(response.data.message || "Failed to delete message");
        }
      } catch (error) {
        console.error("Error deleting comment:", error);
        toast.error("Failed to delete message");
      } finally {
        setDeletingCommentId(null);
      }
    },
    [api_url, token, fetchComments]
  );

  // ========================================
  // REPLY CLICK
  // ========================================

  const handleReplyClick = useCallback((comment) => {
    setReplyTo(comment);
    setTimeout(() => replyInputRef.current?.focus(), 100);
  }, []);

  // ========================================
  // EMOJI CLICK
  // ========================================

  const handleEmojiClick = (emoji) => {
    setNewComment((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  // ========================================
  // KEY PRESS
  // ========================================

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  // ========================================
  // FIREBASE REALTIME LISTENER
  // ========================================

  useEffect(() => {
    if (!workItemId) return;

    const unsubscribe = listenMessages(workItemId, (newMessage) => {
      setComments((prev) => {
        const exists = prev.some((msg) => msg.id === newMessage.id);
        if (exists) return prev;
        return [...prev, newMessage];
      });

      requestAnimationFrame(() => {
        scrollToBottom();
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [workItemId, scrollToBottom]);

  // ========================================
  // FETCH COMMENTS ON MOUNT
  // ========================================

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // ========================================
  // MEMOIZED DATA
  // ========================================

  const groupedComments = useMemo(() => {
    const sorted = sortCommentsByDate(comments);
    return groupCommentsByDate(sorted);
  }, [comments]);

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="tab-card comments-whatsapp-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <FontAwesomeIcon icon={faComment} className="chat-header-icon" />
          <div>
            <h3>Discussion</h3>
            <p>{comments.length} messages</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="chat-messages-area" ref={chatContainerRef}>
        {commentsLoading ? (
          <div className="chat-loading">
            <div className="loading-spinner-small"></div>
            <p>Loading messages...</p>
          </div>
        ) : Object.keys(groupedComments).length > 0 ? (
          Object.entries(groupedComments).map(([date, messages]) => (
            <div key={date}>
              <div className="chat-date-divider">
                <span>{date}</span>
              </div>
              {messages.map((comment) => (
                <MessageBubble
                  key={comment.id}
                  comment={comment}
                  onReply={handleReplyClick}
                  onDelete={handleDeleteComment}
                  currentUserId={currentUserId}
                  STORAGE_URL={STORAGE_URL}
                  employeeName={employeeName}
                  employeeId={employeeId}
                />
              ))}
            </div>
          ))
        ) : (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <h4>No messages yet</h4>
            <p>Start the conversation by sending a message below</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Indicator */}
      {replyTo && (
        <div className="reply-indicator">
          <div className="reply-indicator-content">
            <FontAwesomeIcon icon={faReply} />
            <div className="reply-indicator-preview">
              <span className="reply-indicator-user">
                {replyTo.user?.name || replyTo.employee_id}
              </span>
              <span className="reply-indicator-text">
                {replyTo.comment?.substring(0, 60)}
                {replyTo.comment?.length > 60 ? "..." : ""}
              </span>
            </div>
            <button onClick={() => setReplyTo(null)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="chat-input-area">
        {newCommentFile && (
          <div className="file-preview">
            <FontAwesomeIcon icon={faPaperclip} />
            <span>{newCommentFile.name}</span>
            <button onClick={() => setNewCommentFile(null)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        )}

        <div className="chat-input-wrapper">
          <button
            className="chat-emoji-btn"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Add emoji"
          >
            <FontAwesomeIcon icon={faSmile} />
          </button>

          {showEmojiPicker && (
            <div className="emoji-picker">
              {emojis.map((emoji) => (
                <button key={emoji} onClick={() => handleEmojiClick(emoji)}>
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <textarea
            ref={replyInputRef}
            placeholder={
              replyTo
                ? `Replying to ${replyTo.user?.name || replyTo.employee_id}...`
                : "Type a message..."
            }
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={handleKeyPress}
            rows="1"
          />

          <div className="chat-attach-wrapper">
            <input
              type="file"
              id="chat-file"
              onChange={(e) => setNewCommentFile(e.target.files[0])}
              hidden
            />
            <label htmlFor="chat-file" className="chat-attach-btn" title="Attach file">
              <FontAwesomeIcon icon={faPaperclip} />
            </label>
          </div>

          <button
            className="chat-send-btn"
            onClick={handleSubmitComment}
            disabled={submittingComment || (!newComment.trim() && !newCommentFile)}
          >
            {submittingComment ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faPaperPlane} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDiscussion;
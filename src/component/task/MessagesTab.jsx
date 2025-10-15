import React, { useState, useEffect } from "react";
import { Paperclip } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const MessagesTab = ({
  projectData,
  stor_url,
  currentUser,
  token,
  api_url,
  id,
  getProjectData
}) => {
  const [handleSendMessageLoading, setHandleSendMessageLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [showAttachmentPopup, setShowAttachmentPopup] = useState(false);
  const [selectedAttachmentType, setSelectedAttachmentType] = useState("");
  const [messageAttachments, setMessageAttachments] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [messagesEndRef, setMessagesEndRef] = useState(null);

  // Helper function to determine file type
  const getFileType = (filename) => {
    if (!filename) return "file";

    const ext = filename.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
    if (["pdf"].includes(ext)) return "pdf";
    if (["doc", "docx"].includes(ext)) return "word";
    if (["xls", "xlsx"].includes(ext)) return "excel";
    return "file";
  };

  // Convert API posts to message format
  const convertPostsToMessages = (posts) => {
    return posts.map((post) => {
      const message = {
        id: post.id,
        sender: post.user_name,
        senderCode: post.employee_code,
        content: post.title,
        time: new Date(post.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        file: post.file,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        isCurrentUser: post.employee_code === currentUser,
        attachments: post.file
          ? [
              {
                id: post.id,
                name: post.file.split("/").pop(),
                type: getFileType(post.file),
                size: "N/A",
                url: `${stor_url}/${post.file}`,
              },
            ]
          : [],
        replies: post.replies || [],
        isEdited: false,
        editedAt: null,
        parent_id: post.parent_id,
      };

      return message;
    });
  };

  const messages = convertPostsToMessages(projectData.posts);

  // Message handlers
  const handleSendMessage = async () => {
    if (newMessage.trim() === "" && messageAttachments.length === 0) return;
    setHandleSendMessageLoading(true);
    try {
      const formData = new FormData();
      formData.append("project_id", id);
      formData.append("title", newMessage);

      if (replyingTo) {
        formData.append("parent_id", replyingTo.id);
      }

      messageAttachments.forEach((attachment) => {
        if (attachment.file) {
          formData.append("file", attachment.file);
        }
      });

      const response = await axios.post(`${api_url}/project/post`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === 200) {
        await getProjectData();
        setNewMessage("");
        setMessageAttachments([]);
        setReplyingTo(null);
        toast.success("Message sent successfully");
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setHandleSendMessageLoading(false);
    }
  };

  const handleReplyToMessage = (message) => {
    setReplyingTo(message);
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setEditMessageText(message.content);
  };

  const handleSaveEdit = async () => {
    if (editMessageText.trim() === "") return;

    try {
      const response = await axios.put(
        `${api_url}/project-posts/${editingMessage.id}`,
        {
          title: editMessageText,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        await getProjectData();
        setEditingMessage(null);
        setEditMessageText("");
        toast.success("Message updated successfully");
      } else {
        toast.error("Failed to update message");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?"))
      return;

    try {
      const response = await axios.delete(`${api_url}/project-posts/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        await getProjectData();
        toast.success("Message deleted successfully");
      } else {
        toast.error("Failed to delete message");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleAttachmentTypeSelect = (type) => {
    setSelectedAttachmentType(type);
    setShowAttachmentPopup(false);

    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;

    if (type === "image") {
      input.accept = "image/*";
    } else if (type === "document") {
      input.accept = ".pdf,.doc,.docx,.txt";
    } else if (type === "file") {
      input.accept = "*";
    }

    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      const newAttachments = files.map((file) => ({
        id: Date.now() + Math.random(),
        name: file.name,
        type:
          type === "image"
            ? "image"
            : file.name.endsWith(".pdf")
            ? "pdf"
            : file.name.endsWith(".doc") || file.name.endsWith(".docx")
            ? "word"
            : file.name.endsWith(".xls") || file.name.endsWith(".xlsx")
            ? "excel"
            : "file",
        size: (file.size / 1024 / 1024).toFixed(1) + " MB",
        file: file,
        url: type === "image" ? URL.createObjectURL(file) : null,
      }));

      setMessageAttachments([...messageAttachments, ...newAttachments]);
    };

    input.click();
  };

  const handleRemoveAttachment = (attachmentId) => {
    setMessageAttachments(
      messageAttachments.filter((att) => att.id !== attachmentId)
    );
  };

  const scrollToBottom = () => {
    messagesEndRef?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="messages-content">
      <div className="messages-container">
        <div className="messages-header">
          <h4>Group Messages</h4>
          <small>Team communication channel</small>
        </div>

        <div className="messages-list custom-scroll">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${
                message.isCurrentUser
                  ? "message-current-user"
                  : "message-other-user"
              }`}
            >
              <div className="message-sender">
                {message.sender}
                <span className="message-time">
                  {message.time}
                  {message.isEdited && (
                    <span className="edited-indicator"> (edited)</span>
                  )}
                </span>
              </div>

              {message.parent_id && message.replies.length > 0 && (
                <div className="reply-preview">
                  <div className="reply-sender">
                    {message.replies[0].user_name}
                  </div>
                  <div className="reply-content">
                    {message.replies[0].title}
                  </div>
                </div>
              )}

              {editingMessage && editingMessage.id === message.id ? (
                <div className="edit-message">
                  <textarea
                    value={editMessageText}
                    onChange={(e) => setEditMessageText(e.target.value)}
                    className="edit-textarea"
                  />
                  <div className="edit-actions">
                    <button onClick={handleSaveEdit} className="save-edit-btn">
                      Save
                    </button>
                    <button
                      onClick={() => setEditingMessage(null)}
                      className="cancel-edit-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="message-content">{message.content}</div>
              )}

              {message.attachments && message.attachments.length > 0 && (
                <div className="message-attachments">
                  {message.attachments.map((attachment) => (
                    <div key={attachment.id} className="attachment-item">
                      {attachment.type === "image" ? (
                        <div className="image-preview">
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            onClick={() =>
                              window.open(attachment.url, "_blank")
                            }
                            style={{ cursor: "pointer" }}
                          />
                        </div>
                      ) : (
                        <div
                          className="file-attachment"
                          onClick={() => window.open(attachment.url, "_blank")}
                          style={{ cursor: "pointer" }}
                        >
                          <span className="attachment-icon">
                            {attachment.type === "pdf"
                              ? "📄"
                              : attachment.type === "word"
                              ? "📝"
                              : attachment.type === "excel"
                              ? "📊"
                              : "📎"}
                          </span>
                          <span className="attachment-name">
                            {attachment.name}
                          </span>
                          <span className="attachment-size">
                            {attachment.size}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {message.replies && message.replies.length > 0 && (
                <div className="message-replies">
                  {message.replies.map((reply) => (
                    <div key={reply.id} className="reply-item">
                      <div className="reply-sender">{reply.user_name}</div>
                      <div className="reply-content">{reply.title}</div>
                      <div className="reply-time">
                        {new Date(reply.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="message-actions">
                <button
                  className="action-btn reply-btn"
                  onClick={() => handleReplyToMessage(message)}
                >
                  💬 Reply
                </button>
                {message.isCurrentUser && (
                  <>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEditMessage(message)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteMessage(message.id)}
                    >
                      🗑️ Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={setMessagesEndRef} />
        </div>

        <div className="message-input-container">
          {replyingTo && (
            <div className="reply-indicator">
              <span>Replying to {replyingTo.sender}</span>
              <button onClick={() => setReplyingTo(null)}>×</button>
            </div>
          )}

          {messageAttachments.length > 0 && (
            <div className="attachments-preview">
              {messageAttachments.map((attachment) => (
                <div key={attachment.id} className="attachment-preview">
                  {attachment.type === "image" ? (
                    <div className="image-preview-small">
                      <img src={attachment.url} alt={attachment.name} />
                      <span className="image-name">{attachment.name}</span>
                    </div>
                  ) : (
                    <div className="file-preview">
                      <span className="file-icon">
                        {attachment.type === "pdf"
                          ? "📄"
                          : attachment.type === "word"
                          ? "📝"
                          : attachment.type === "excel"
                          ? "📊"
                          : "📎"}
                      </span>
                      <span className="file-name">{attachment.name}</span>
                    </div>
                  )}
                  <button
                    className="remove-attachment"
                    onClick={() => handleRemoveAttachment(attachment.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="message-input">
            <input
              type="text"
              placeholder={
                replyingTo
                  ? `Reply to ${replyingTo.sender}...`
                  : "Type your message..."
              }
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              className="attachment-btn"
              onClick={() => setShowAttachmentPopup(true)}
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button 
              disabled={handleSendMessageLoading}
              onClick={handleSendMessage}
            >
              Send Message
            </button>
          </div>
        </div>
      </div>

      {/* Attachment Popup */}
      {showAttachmentPopup && (
        <div
          className="attachment-popup-overlay"
          onClick={() => setShowAttachmentPopup(false)}
        >
          <div
            className="attachment-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="attachment-popup-header">
              <h4>Attach File</h4>
              <button onClick={() => setShowAttachmentPopup(false)}>×</button>
            </div>
            <div className="attachment-options">
              <button
                className="attachment-option"
                onClick={() => handleAttachmentTypeSelect("image")}
              >
                <span className="option-icon">🖼️</span>
                <span className="option-label">Image</span>
                <span className="option-desc">Photos, screenshots</span>
              </button>
              <button
                className="attachment-option"
                onClick={() => handleAttachmentTypeSelect("document")}
              >
                <span className="option-icon">📄</span>
                <span className="option-label">Document</span>
                <span className="option-desc">PDF, Word, Text files</span>
              </button>
              <button
                className="attachment-option"
                onClick={() => handleAttachmentTypeSelect("file")}
              >
                <span className="option-icon">📎</span>
                <span className="option-label">File</span>
                <span className="option-desc">Any file type</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesTab;
import React, { useEffect, useRef, useCallback, useState, useContext } from "react";
import "./ViewProject.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCommentAlt,
  faPaperclip,
  faFileImage,
  faFilePdf,
  faFileWord,
  faFileAlt,
  faTimes,
  faReply,
  faPaperPlane,
  faDownload,
  faSmile,
  faMicrophone
} from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../../../context/AuthContex";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ProjectDetails from "../../../component/task/ProjectDetails";
// import ProjectDetails from "./ProjectDetails"; // Import the new component

const ViewProject = () => {
  const { id } = useParams();
  const { token, data } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;
  const stor_url = import.meta.env.VITE_STORAGE_URL;
  const [loading, setLoading] = useState(true);
  const currentUser = data?.employee_id; // Use the logged-in user's employee code
  const chatBoxRef = useRef(null);
  const fileInputRef = useRef(null);
  const [newMessage, setNewMessage] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const [showFileTypes, setShowFileTypes] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const resizeObserverRef = useRef(null);

  // State for project data from API
  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    status: "",
    members: [],
    tasks: [],
    posts: []
  });

  const getProjectData = async () => {
    try {
      const response = await axios.get(`${api_url}/projects/members/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 200) {
        const data = response.data.data;
        setProjectData({
          title: data.project.project.title,
          description: data.project.project.description,
          status: data.project.project.status,
          members: data.project.members || [],
          tasks: data.project.tasks || [],
          posts: data.posts || []
        });
      } else {
        toast.error("Failed to fetch project data");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProjectData();
  }, []);

  // Convert API posts to message format
  const convertPostsToMessages = (posts) => {
    return posts.map(post => {
      const message = {
        id: post.id,
        // parentId: post.parent_id,
        sender: post.user_name,
        senderCode: post.employee_code,
        text: post.title,
        time: new Date(post.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        }),
        file: post.file
      };

      // If this is a reply, add replyTo information
      if (post.parent_id && post.replies && post.replies.length > 0) {
        const originalPost = post.replies[0];
        message.replyTo = {
          id: originalPost.id,
          sender: originalPost.user_name,
          text: originalPost.title
        };
      }

      return message;
    });
  };

  // Scroll to bottom handler with debouncing
  const scrollToBottom = useCallback((behavior = "smooth") => {
    if (chatBoxRef.current) {
      try {
        chatBoxRef.current.scrollTo({
          top: chatBoxRef.current.scrollHeight,
          behavior,
        });
        setIsAtBottom(true);
      } catch (error) {
        // Fallback for browsers that don't support scroll options
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
    }
  }, []);

  // Handle scroll events to detect if user has scrolled up
  const handleScroll = useCallback(() => {
    if (chatBoxRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;
      const atBottom = scrollHeight - (scrollTop + clientHeight) < 50;
      setIsAtBottom(atBottom);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive and user is at bottom
  useEffect(() => {
    if (isAtBottom && projectData.posts.length > 0) {
      scrollToBottom();
    }
  }, [projectData.posts, isAtBottom, scrollToBottom]);

  // Set up resize observer to handle container size changes
  useEffect(() => {
    if (chatBoxRef.current && window.ResizeObserver) {
      resizeObserverRef.current = new ResizeObserver(() => {
        if (isAtBottom) {
          scrollToBottom("auto");
        }
      });
      resizeObserverRef.current.observe(chatBoxRef.current);
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [isAtBottom, scrollToBottom]);

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newAttachments = files.map(file => ({
        file,
        name: file.name,
        type: file.type.split('/')[0], // 'image', 'application', etc.
        size: file.size,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      }));
      setAttachments([...attachments, ...newAttachments]);
      setShowFileTypes(false);
    }
    e.target.value = null; // Reset file input
  };

  // Remove attachment
  const removeAttachment = (index) => {
    const newAttachments = [...attachments];
    if (newAttachments[index].preview) {
      URL.revokeObjectURL(newAttachments[index].preview);
    }
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  // Get file icon based on type
  const getFileIcon = (fileType, fileName) => {
    if (fileType === 'image') return faFileImage;
    if (fileName.endsWith('.pdf')) return faFilePdf;
    if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) return faFileWord;
    return faFileAlt;
  };

  // Handle reply to a message
  const handleReply = (message) => {
    setReplyingTo(message);
    setShowEmojiPicker(false);
    // Scroll to the message being replied to
    const messageElement = document.getElementById(`message-${message.id}`);
    if (messageElement) {
      messageElement.classList.add('highlight-message');
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        messageElement.classList.remove('highlight-message');
      }, 2000);
    }
  };

  // Cancel reply
  const cancelReply = () => {
    setReplyingTo(null);
  };

  // Handle sending message with attachments and replies
  const handleSendMessage = useCallback(async () => {
    if (newMessage.trim() || attachments.length > 0) {
      try {
        const formData = new FormData();
        formData.append('title', newMessage);
        formData.append('project_id', id);

        if (replyingTo) {
          formData.append('parent_id', replyingTo.id);
          // console.log('parentId: ', replyingTo.id);
          
        }

        // Add attachments if any
        attachments.forEach(attachment => {
          formData.append('file', attachment.file);
        });

        const response = await axios.post(`${api_url}/project/post`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log(response.data);
        if (response.data.status === 200) {
          // Refresh project data to get the new post
          getProjectData();
          

          // Clear attachments and message
          attachments.forEach(att => {
            if (att.preview) URL.revokeObjectURL(att.preview);
          });
          setAttachments([]);
          setNewMessage("");
          setShowFileTypes(false);
          setReplyingTo(null);
        } else {
          toast.error("Failed to send message");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error sending message");
      }
    }
  }, [newMessage, attachments, replyingTo, id, token, api_url]);

  // Handle Enter key press
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      attachments.forEach(att => {
        if (att.preview) URL.revokeObjectURL(att.preview);
      });
    };
  }, [attachments]);

  if (loading) {
    return <div className="loading">Loading project data...</div>;
  }

  return (
    <div className="viewproject-container">
      {/* Left Side - Project Details */}
      <ProjectDetails projectData={projectData} />

      {/* Right Side - Group Messages */}
      <div className="project-chat">
        <div className="chat-header">
          <FontAwesomeIcon icon={faCommentAlt} aria-hidden="true" />
          <h3>Team Discussion</h3>
          <div className="online-indicators">
            <span className="online-count">{projectData.members.length} members</span>
            <div className="online-dots">
              {projectData.members.slice(0, 3).map((member, index) => (
                <div key={index} className="online-dot" style={{ backgroundColor: ['#4cc9f0', '#3a86ff', '#ff006e'][index] }}></div>
              ))}
            </div>
          </div>
        </div>

        {/* Reply indicator */}
        {replyingTo && (
          <div className="reply-indicator">
            <div className="reply-info">
              <span>Replying to {replyingTo.sender}</span>
              <p>{replyingTo.text.length > 50 ? `${replyingTo.text.substring(0, 50)}...` : replyingTo.text}</p>
            </div>
            <button className="cancel-reply" onClick={cancelReply}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        )}

        <div
          className="chat-box custom-scroll"
          ref={chatBoxRef}
          onScroll={handleScroll}
          aria-live="polite"
        >
          {convertPostsToMessages(projectData.posts).map((msg) => (
            <div
              key={msg.id}
              id={`message-${msg.id}`}
              className={`chat-message ${msg.senderCode === currentUser ? "mine" : ""}`}
              aria-label={`Message from ${msg.sender}`}
            >
              {msg.senderCode !== currentUser && (
                <div className="message-sender">{msg.sender}</div>
              )}
              <div className="message-content">
                {/* Reply preview */}
                {msg.replyTo && (
                  <div className="reply-preview">
                    <FontAwesomeIcon icon={faReply} className="reply-icon" />
                    <div className="reply-content">
                      <span className="reply-sender">{msg.replyTo.sender}</span>
                      <p className="reply-text">{msg.replyTo.text}</p>
                    </div>
                  </div>
                )}


                {msg.file && (
                  <div className="message-attachments">
                    <div className="attachment">
                      {/* Check if file is an image */}
                      {msg.file.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                        <div className="image-preview">
                          <img
                            src={`${stor_url}/${msg.file}`}
                            alt="Attachment"
                            onClick={() => window.open(`${stor_url}/${msg.file}`, '_blank')}
                          />
                          <a
                            href={`${stor_url}/${msg.file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="attachment-download"
                            download
                          >
                            <FontAwesomeIcon icon={faDownload} />
                          </a>
                        </div>
                      ) : msg.file.match(/\.(pdf)$/i) ? (
                        <div className="pdf-preview">
                          <div className="pdf-icon">
                            <FontAwesomeIcon icon={faFilePdf} />
                          </div>
                          <div className="pdf-actions">
                            <a
                              href={`${stor_url}/${msg.file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="preview-link"
                            >
                              Preview PDF
                            </a>
                            <a
                              href={`${stor_url}/${msg.file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="download-link"
                              download
                            >
                              <FontAwesomeIcon icon={faDownload} />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="file-attachment">
                          <FontAwesomeIcon
                            icon={getFileIcon('', msg.file)}
                            className="attachment-icon"
                          />
                          <a
                            href={`${stor_url}/${msg.file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="attachment-name"
                          >
                            {msg.file.split('/').pop()}
                          </a>
                          <a
                            href={`${stor_url}/${msg.file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="attachment-download"
                            download
                          >
                            <FontAwesomeIcon icon={faDownload} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {msg.text && <div className="message-text">{msg.text}</div>}
                <div className="message-footer">
                  <div className="message-time" aria-hidden="true">
                    {msg.time}
                  </div>
                  <button
                    className="reply-button"
                    onClick={() => {
                      handleReply(msg);
                      console.log("Reply button clicked!", msg);
                    }}
                    aria-label={`Reply to ${msg.sender}`}
                  >
                    <FontAwesomeIcon icon={faReply} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="attachments-preview">
            {attachments.map((att, index) => (
              <div key={index} className="attachment-preview-item">
                {att.preview ? (
                  <div className="image-preview">
                    <img src={att.preview} alt={att.name} />
                    <button onClick={() => removeAttachment(index)} className="remove-attachment">
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                ) : (
                  <div className="file-preview">
                    <FontAwesomeIcon icon={getFileIcon(att.type, att.name)} />
                    <span>{att.name}</span>
                    <button onClick={() => removeAttachment(index)} className="remove-attachment">
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="chat-input-container">
          <div className="file-attachment-options">
            <button
              className="attach-button"
              onClick={() => setShowFileTypes(!showFileTypes)}
              aria-label="Attach files"
            >
              <FontAwesomeIcon icon={faPaperclip} />
            </button>

            {showFileTypes && (
              <div className="file-type-options">
                <label className="file-option">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    multiple
                  />
                  <FontAwesomeIcon icon={faFileImage} />
                  <span>Image</span>
                </label>
                <label className="file-option" >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    multiple
                  />
                  <FontAwesomeIcon icon={faFilePdf} />
                  <span>PDF</span>
                </label>
                <label className="file-option">
                  <input
                    type="file"
                    accept=".doc,.docx"
                    onChange={handleFileChange}
                    multiple
                  />
                  <FontAwesomeIcon icon={faFileWord} />
                  <span>Word</span>
                </label>
                <label className="file-option">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    multiple
                  />
                  <FontAwesomeIcon icon={faFileAlt} />
                  <span>Any File</span>
                </label>
              </div>
            )}
          </div>

          <div className="chat-input-wrapper">
            <div className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={replyingTo ? `Replying to ${replyingTo.sender}...` : "Write your message here..."}
                aria-label="Type your message"
              />
            </div>
            <button
              className="send-button"
              onClick={handleSendMessage}
              aria-label="Send message"
              disabled={!newMessage.trim() && attachments.length === 0}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProject;
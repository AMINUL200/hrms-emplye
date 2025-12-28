import React, { useState, useEffect, useRef, useContext } from "react";
import "./MessageCenter.css";
import { AuthContext } from "../../../context/AuthContex";
import axios from "axios";
import PageLoader from "../../../component/loader/PageLoader";
import useProjectChatPusher from "../../../hooks/usePusherMessages";

// Helper function to get file type
const getFileType = (filename) => {
  if (!filename) return "file";

  const ext = filename.split(".").pop().toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  if (["pdf"].includes(ext)) return "pdf";
  if (["doc", "docx"].includes(ext)) return "word";
  if (["xls", "xlsx"].includes(ext)) return "excel";
  return "file";
};

// Helper function to get file icon
const getFileIcon = (fileType) => {
  switch (fileType) {
    case "image":
      return "🖼️";
    case "pdf":
      return "📄";
    case "word":
      return "📝";
    case "excel":
      return "📊";
    default:
      return "📎";
  }
};

// Color palette for avatar backgrounds
const avatarColors = [
  "#FF902F",
  "#667eea",
  "#764ba2",
  "#4CAF50",
  "#2196F3",
  "#9C27B0",
  "#3F51B5",
  "#009688",
  "#FF5722",
  "#795548",
];

const MessageCenter = () => {
  const { token, data } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;
  const stor_url = import.meta.env.VITE_STORAGE_URL;

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showAttachmentPopup, setShowAttachmentPopup] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Check if mobile view on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch projects data
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${api_url}/message-center`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() }, // Prevent caching
        });

        if (response.data.status === 200) {
          const projectsData = response.data.projects.map((project, index) => {
            // Format time for last message
            const lastMessage =
              project.messages?.length > 0
                ? project.messages[project.messages.length - 1]
                : null;

            return {
              project_id: project.project_id,
              project_name: project.project_name,
              status: project.status,
              type: "group",
              unread: 0,
              isOnline: false,
              lastMessage: lastMessage
                ? `${
                    lastMessage.employee_code === data?.employee_id
                      ? "You"
                      : lastMessage.user_name?.split(" ")[0]
                  }: ${lastMessage.message?.substring(0, 30)}${
                    lastMessage.message?.length > 30 ? "..." : ""
                  }`
                : "No messages yet",
              timestamp: lastMessage ? getTimeAgo(lastMessage.created_at) : "",
              members: project.members || [],
              messages: project.messages || [],
              avatarColor: avatarColors[index % avatarColors.length],
              groupAvatar: getProjectInitials(project.project_name),
            };
          });

          setProjects(projectsData);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProjects();
    }
  }, [token, data?.employee_id]);

  // Helper function to get time ago
  const getTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours === 0) {
          const diffMinutes = Math.floor(diffMs / (1000 * 60));
          return diffMinutes < 1 ? "Just now" : `${diffMinutes}m ago`;
        }
        return `${diffHours}h ago`;
      }
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
      return `${Math.floor(diffDays / 30)}mo ago`;
    } catch {
      return "";
    }
  };

  // Format time for display
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // Filter projects based on search
  const filteredProjects = projects.filter(
    (project) =>
      project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.members.some((member) =>
        member.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Handle project selection
  const handleProjectSelect = (project) => {
    setSelectedProject({
      ...project,
      unread: 0,
    });

    setProjects((prev) =>
      prev.map((p) =>
        p.project_id === project.project_id ? { ...p, unread: 0 } : p
      )
    );

    if (isMobileView) {
      setShowChat(true);
    }
  };

  // Handle back to project list on mobile
  const handleBackToProjects = () => {
    setShowChat(false);
    setSelectedProject(null);
    setReplyingTo(null);
    setEditingMessage(null);
    setAttachments([]);
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if ((!messageText.trim() && attachments.length === 0) || !selectedProject)
      return;

    setSendingMessage(true);
    try {
      const formData = new FormData();
      formData.append("project_id", selectedProject.project_id);

      if (editingMessage) {
        // Editing existing message
        formData.append("title", messageText.trim());
        const response = await axios.put(
          `${api_url}/project-posts/${editingMessage.id}`,
          {
            title: messageText.trim(),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 200) {
          await refreshProjectMessages(selectedProject.project_id);
          setEditingMessage(null);
          setMessageText("");
          setAttachments([]);
        }
      } else {
        // Sending new message or reply
        formData.append("title", messageText.trim());

        if (replyingTo) {
          formData.append("parent_id", replyingTo.id);
        }

        // Add file attachments if any
        attachments.forEach((attachment, index) => {
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
          // Refresh messages
          await refreshProjectMessages(selectedProject.project_id);

          setMessageText("");
          setAttachments([]);
          setReplyingTo(null);
        }
      }
    } catch (error) {
      console.error("Error sending/editing message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  // Refresh messages for a specific project
  const refreshProjectMessages = async (projectId) => {
    try {
      const response = await axios.get(
        `${api_url}/projects/members/${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() }, // Prevent caching
        }
      );

      if (response.data.status === 200) {
        const projectData = response.data.data.project;
        const messages = response.data.data.posts || [];

        // Update selected project messages
        if (selectedProject?.project_id === projectId) {
          setSelectedProject((prev) => ({
            ...prev,
            messages: messages,
          }));
        }

        // Update projects list
        setProjects((prev) =>
          prev.map((project) => {
            if (project.project_id === projectId) {
              const lastMessage =
                messages.length > 0 ? messages[messages.length - 1] : null;
              return {
                ...project,
                messages: messages,
                lastMessage: lastMessage
                  ? `${
                      lastMessage.employee_code === data?.employee_id
                        ? "You"
                        : lastMessage.user_name?.split(" ")[0]
                    }: ${lastMessage.message?.substring(0, 30)}${
                      lastMessage.message?.length > 30 ? "..." : ""
                    }`
                  : project.lastMessage,
                timestamp: lastMessage
                  ? getTimeAgo(lastMessage.created_at)
                  : project.timestamp,
              };
            }
            return project;
          })
        );
      }
    } catch (error) {
      console.error("Error refreshing messages:", error);
    }
  };

  // Handle edit message
  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setReplyingTo(null);
    setMessageText(message.message || message.title || "");
    inputRef.current?.focus();
  };

  // Handle reply to message
  const handleReplyToMessage = (message) => {
    setReplyingTo(message);
    setEditingMessage(null);
    inputRef.current?.focus();
  };

  // Handle delete message
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?"))
      return;

    try {
      const response = await axios.delete(
        `${api_url}/project-posts/${messageId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        await refreshProjectMessages(selectedProject.project_id);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle project avatar/name click
  const handleProjectClick = () => {
    if (selectedProject?.type === "group") {
      setShowProjectDetails(true);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: getFileType(file.name),
      icon: getFileIcon(getFileType(file.name)),
      file: file,
      url: URL.createObjectURL(file),
      size: (file.size / 1024 / 1024).toFixed(1) + " MB",
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
    setShowAttachmentPopup(false);
  };

  // Remove attachment
  const handleRemoveAttachment = (id) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  // Cancel reply or edit
  const handleCancelAction = () => {
    setReplyingTo(null);
    setEditingMessage(null);
    setMessageText("");
  };

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedProject?.messages, isTyping]);

  // Focus input when project is selected
  useEffect(() => {
    if (selectedProject) {
      inputRef.current?.focus();
    }
  }, [selectedProject]);

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get project initials for group avatar
  const getProjectInitials = (name) => {
    const words = name.split(" ");
    if (words.length >= 2) {
      return words[0][0] + words[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get project avatar display
  const getProjectAvatar = (project) => {
    if (project.type === "group") {
      if (project.groupAvatar && project.groupAvatar.length === 2) {
        return project.groupAvatar;
      }
      return getInitials(project.project_name);
    }
    return getInitials(project.project_name);
  };

  // Get current user role in project
  const getCurrentUserRole = () => {
    if (!selectedProject || !data?.employee_id) return "";
    const member = selectedProject.members.find(
      (m) => m.emp_code === data.employee_id
    );
    return member?.role || "Member";
  };

  // Check if message is from current user
  const isMessageFromCurrentUser = (message) => {
    return message.employee_code === data?.employee_id;
  };

  // Get input placeholder text
  const getInputPlaceholder = () => {
    if (editingMessage) return "Edit your message...";
    if (replyingTo)
      return `Reply to ${replyingTo.user_name || replyingTo.employee_code}...`;
    return `Message in ${selectedProject?.project_name || "project"}...`;
  };
  useProjectChatPusher(
    data?.emid,
    selectedProject?.project_id,
    (pusherData) => {
      console.log("📨 Pusher callback received:", pusherData);

      // 🚫 Ignore my own messages (avoid duplicates)
      //   if (pusherData.data.emid === data?.emid) {
      //     console.log("Ignoring own message");
      //     return;
      //   }

      // Extract post data from Pusher response
      const post = pusherData.data.post;

      // Transform the message to match your expected format
      const transformedMessage = {
        id: post?.id,
        message: post?.title || "", // Using title field from your data
        employee_code: post?.employee_code,
        user_name: `User ${post?.employee_code}`, // Format name from employee code
        created_at: post?.created_at,
        file: post?.file,
        title: post?.title,
        project_id: post?.project_id || pusherData.project_id,
        emid: post?.emid,
        parent_id: post?.parent_id,
      };

      console.log("🔄 Transformed message:", transformedMessage);

      // Check if this message is for the currently selected project
      const selectedId = Number(selectedProject?.project_id);
      const incomingId = Number(transformedMessage.project_id);

      const isForSelectedProject = selectedId === incomingId;

      if (isForSelectedProject) {
        /* =========================
      1️⃣ Update OPEN CHAT
    ========================== */
        setSelectedProject((prev) => {
          if (!prev) return prev;

          // Check if message already exists to avoid duplicates
          const messageExists = prev.messages.some(
            (msg) => msg.id === transformedMessage.id
          );
          if (messageExists) {
            console.log("Message already exists in chat, skipping");
            return prev;
          }

          return {
            ...prev,
            messages: [...prev.messages, transformedMessage],
          };
        });

        /* =========================
      2️⃣ Update LEFT SIDEBAR for the selected project
    ========================== */
        setProjects((prev) =>
          prev.map((project) => {
            if (project.project_id === selectedProject.project_id) {
              // Update the selected project in sidebar
              const messageExists = project.messages.some(
                (msg) => msg.id === transformedMessage.id
              );
              if (messageExists) return project;

              return {
                ...project,
                lastMessage: `${
                  transformedMessage.user_name
                }: ${transformedMessage.message?.substring(0, 30)}${
                  transformedMessage.message?.length > 30 ? "..." : ""
                }`,
                timestamp: "Just now",
                unread: 0, // No unread since we're viewing it
                messages: [...project.messages, transformedMessage],
              };
            }

            // For other projects, increment unread count
            if (project.project_id === transformedMessage.project_id) {
              const messageExists = project.messages.some(
                (msg) => msg.id === transformedMessage.id
              );
              if (messageExists) return project;

              return {
                ...project,
                lastMessage: `${
                  transformedMessage.user_name
                }: ${transformedMessage.message?.substring(0, 30)}${
                  transformedMessage.message?.length > 30 ? "..." : ""
                }`,
                timestamp: "Just now",
                unread: (project.unread || 0) + 1, // Increment unread count
                messages: [...project.messages, transformedMessage],
              };
            }

            return project;
          })
        );
      } else {
        /* =========================
      3️⃣ Message for a different project - update sidebar only
    ========================== */
        console.log(
          `🔴 New message for project ${transformedMessage.project_id}, incrementing unread`
        );

        setProjects((prev) =>
          prev.map((project) => {
            if (project.project_id === transformedMessage.project_id) {
              // Check if message already exists
              const messageExists = project.messages.some(
                (msg) => msg.id === transformedMessage.id
              );
              if (messageExists) return project;

              return {
                ...project,
                lastMessage: `${
                  transformedMessage.user_name
                }: ${transformedMessage.message?.substring(0, 30)}${
                  transformedMessage.message?.length > 30 ? "..." : ""
                }`,
                timestamp: "Just now",
                unread: (project.unread || 0) + 1, // Increment unread count
                messages: [...project.messages, transformedMessage],
              };
            }
            return project;
          })
        );
      }
    }
  );

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="message-center-container">
      {/* Project Details Popup */}
      {showProjectDetails && selectedProject?.type === "group" && (
        <div
          className="group-details-overlay"
          onClick={() => setShowProjectDetails(false)}
        >
          <div
            className="group-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Project Information</h3>
              <button
                className="close-btn"
                onClick={() => setShowProjectDetails(false)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="modal-content">
              <div
                className="group-avatar-large"
                style={{ backgroundColor: selectedProject.avatarColor }}
              >
                {getProjectAvatar(selectedProject)}
              </div>

              <div className="group-name">{selectedProject.project_name}</div>
              <div className="group-status">
                <span
                  className={`status-badge status-${selectedProject.status}`}
                >
                  {selectedProject.status}
                </span>
              </div>
              <div className="group-members-count">
                {selectedProject.members.length} members
              </div>

              <div className="members-list">
                <h4>Team Members</h4>
                {selectedProject.members.map((member, index) => (
                  <div key={index} className="member-item">
                    <div
                      className="member-avatar"
                      style={{
                        backgroundColor:
                          avatarColors[index % avatarColors.length],
                      }}
                    >
                      {getInitials(member.employee_name)}
                    </div>
                    <div className="member-info">
                      <div className="member-name">
                        {member.employee_name}
                        {member.emp_code === data?.employee_id && (
                          <span className="you-badge">You</span>
                        )}
                      </div>
                      <div className="member-code">{member.emp_code}</div>
                    </div>
                    <div className="member-role">{member.role}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebar - Hidden on mobile when chat is shown */}
      <div
        className={`message-sidebar ${
          isMobileView && showChat ? "hidden" : ""
        }`}
      >
        <div className="sidebar-header">
          <h2>Project Messages</h2>
          <button
            className="new-chat-btn"
            title="Refresh"
            onClick={() => window.location.reload()}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
          </button>
        </div>

        <div className="search-container">
          <input
            type="text"
            className="search-box"
            placeholder="Search projects or members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="contacts-list">
          {filteredProjects.length === 0 ? (
            <div className="no-projects">
              <div className="no-projects-icon">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <p>No projects found</p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div
                key={project.project_id}
                className={`contact-item ${
                  selectedProject?.project_id === project.project_id
                    ? "active"
                    : ""
                }`}
                onClick={() => handleProjectSelect(project)}
              >
                <div
                  className="contact-avatar group-avatar-container"
                  style={{ backgroundColor: project.avatarColor }}
                >
                  {getProjectAvatar(project)}
                  <div className="group-badge">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                </div>
                <div className="contact-info">
                  <div className="contact-name">{project.project_name}</div>
                  <div className="last-message">
                    {project.lastMessage}
                    {project.unread > 0 && (
                      <span className="unread-badge">{project.unread}</span>
                    )}
                  </div>
                  <div className="contact-details">
                    <span className="message-time">{project.timestamp}</span>
                    <span className="group-members-count">
                      {project.members.length} members
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Chat Area - Full width on mobile when chat is shown */}
      <div className={`chat-area ${isMobileView && !showChat ? "hidden" : ""}`}>
        {!selectedProject ? (
          <div className="empty-chat">
            <div className="empty-chat-icon">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <h3>Project Messages</h3>
            <p>Select a project to view messages</p>
          </div>
        ) : (
          <>
            {/* Chat Header with back button on mobile */}
            <div className="chat-header">
              {isMobileView && (
                <div className="back-button" onClick={handleBackToProjects}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </div>
              )}
              <div className="chat-user-info" onClick={handleProjectClick}>
                <div
                  className="chat-header-avatar group-chat-avatar"
                  style={{ backgroundColor: selectedProject.avatarColor }}
                >
                  {getProjectAvatar(selectedProject)}
                  <div className="group-badge">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", color: "#090909" }}>
                    {selectedProject.project_name}
                    <span className="group-badge-text">Project</span>
                  </h3>
                  <div className="chat-user-status">
                    <div className="group-members-preview">
                      {selectedProject.members
                        .slice(0, 3)
                        .map((member, index) => (
                          <span key={index} className="member-preview">
                            {member.employee_name.split(" ")[0]}
                            {index < 2 &&
                              index < selectedProject.members.length - 1 &&
                              ", "}
                          </span>
                        ))}
                      {selectedProject.members.length > 3 && (
                        <span className="more-members">
                          +{selectedProject.members.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="chat-actions">
                <div
                  className="action-icon"
                  onClick={() =>
                    refreshProjectMessages(selectedProject.project_id)
                  }
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="messages-container">
              {selectedProject.messages.length === 0 ? (
                <div className="no-messages">
                  <div className="no-messages-icon">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  </div>
                  <h4>No messages yet</h4>
                  <p>Start the conversation by sending a message</p>
                </div>
              ) : (
                <>
                  {selectedProject.messages.map((message) => {
                    const isCurrentUser = isMessageFromCurrentUser(message);
                    return (
                      <div
                        key={message.id}
                        className={`message ${
                          isCurrentUser ? "sent" : "received"
                        }`}
                      >
                        <div className="message-content-wrapper">
                          {!isCurrentUser && (
                            <div className="message-sender">
                              {message.user_name || message.employee_code}
                            </div>
                          )}
                          <div className="message-text">
                            {message.message || message.title}
                          </div>
                          {message.file && (
                            <div className="message-attachment">
                              <div
                                className="attachment-preview"
                                onClick={() =>
                                  window.open(
                                    `${stor_url}/${message.file}`,
                                    "_blank"
                                  )
                                }
                              >
                                <span className="attachment-icon">
                                  {getFileIcon(getFileType(message.file))}
                                </span>
                                <span className="attachment-name">
                                  {message.file.split("/").pop()}
                                </span>
                              </div>
                            </div>
                          )}
                          {message.replies && message.replies.length > 0 && (
                            <div className="message-replies">
                              {message.replies.map((reply) => (
                                <div key={reply.id} className="reply-item">
                                  <div className="reply-sender">
                                    {reply.user_name || reply.employee_code}
                                  </div>
                                  <div className="reply-text">
                                    {reply.message || reply.title}
                                  </div>
                                  <div className="reply-time">
                                    {formatTime(reply.created_at)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="message-meta">
                            <div className="message-time">
                              {formatTime(message.created_at)}
                            </div>
                            <div className="message-actions">
                              <button
                                className="message-action-btn reply-btn"
                                onClick={() => handleReplyToMessage(message)}
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                              </button>
                              {isCurrentUser && (
                                <>
                                  <button
                                    className="message-action-btn edit-btn"
                                    onClick={() => handleEditMessage(message)}
                                  >
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                  </button>
                                  <button
                                    className="message-action-btn delete-btn"
                                    onClick={() =>
                                      handleDeleteMessage(message.id)
                                    }
                                  >
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {isTyping && (
                    <div className="typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="message-input-container">
              {(replyingTo || editingMessage) && (
                <div className="action-indicator">
                  <div className="action-info">
                    {editingMessage ? (
                      <>
                        <span className="action-icon">✏️</span>
                        <span>Editing message</span>
                      </>
                    ) : (
                      <>
                        <span className="action-icon">↩️</span>
                        <span>
                          Replying to{" "}
                          {replyingTo.user_name || replyingTo.employee_code}
                        </span>
                      </>
                    )}
                  </div>
                  <button
                    className="cancel-action-btn"
                    onClick={handleCancelAction}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {attachments.length > 0 && (
                <div className="attachments-preview">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="attachment-preview-item"
                    >
                      <span className="attachment-icon">{attachment.icon}</span>
                      <span className="attachment-name">{attachment.name}</span>
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
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  multiple
                  onChange={handleFileSelect}
                />
                <div
                  className="input-attachment"
                  onClick={() => setShowAttachmentPopup(!showAttachmentPopup)}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  className="message-input-field"
                  placeholder={getInputPlaceholder()}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={sendingMessage}
                />
                <button
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={
                    (!messageText.trim() && attachments.length === 0) ||
                    sendingMessage
                  }
                >
                  {sendingMessage ? (
                    <div className="sending-spinner"></div>
                  ) : editingMessage ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {showAttachmentPopup && (
                <div className="attachment-options-popup">
                  <button onClick={() => fileInputRef.current?.click()}>
                    📎 File
                  </button>
                  <button
                    onClick={() => {
                      setShowAttachmentPopup(false);
                      fileInputRef.current?.click();
                    }}
                  >
                    🖼️ Image
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessageCenter;

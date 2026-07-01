import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import "./MessageCenter.css";
import { AuthContext } from "../../../context/AuthContex";
import axios from "axios";
import PageLoader from "../../../component/loader/PageLoader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUp } from "@fortawesome/free-solid-svg-icons";
import { listenProjectMessages } from "../../../service/projectChatService";
import { useSearchParams } from "react-router-dom";

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
  "#0A4FA5",
  "#0D6EAF",
  "#138A8A",
  "#1565C0",
  "#1A73E8",
  "#00897B",
  "#0D47A1",
  "#00796B",
  "#1976D2",
  "#0097A7",
];

const MessageCenter = () => {
  const {
    token,
    data,
    projectSummary,
    totalUnreadMessages,
    setTotalUnreadMessages,
  } = useContext(AuthContext);

  const api_url = import.meta.env.VITE_API_URL;
  const stor_url = import.meta.env.VITE_STORAGE_URL;

  const [searchParams] = useSearchParams();

  const projectId = searchParams.get("project");

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
  const [markingAsRead, setMarkingAsRead] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const unsubscribeChatRef = useRef(null);

  // Check if mobile view on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Helper function to get time ago
  const getTimeAgo = useCallback((dateString) => {
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
  }, []);

  // Format time for display
  const formatTime = useCallback((dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }, []);

  // Get initials for avatar
  const getInitials = useCallback((name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, []);

  // Get project initials for group avatar
  const getProjectInitials = useCallback((name) => {
    const words = name.split(" ");
    if (words.length >= 2) {
      return words[0][0] + words[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  }, []);

  // Get project avatar display
  const getProjectAvatar = useCallback(
    (project) => {
      if (project.type === "group") {
        if (project.groupAvatar && project.groupAvatar.length === 2) {
          return project.groupAvatar;
        }
        return getInitials(project.project_name);
      }
      return getInitials(project.project_name);
    },
    [getInitials],
  );

  // Fetch projects data - ONLY ONCE on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${api_url}/message-center`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() },
        });

        if (response.data.status === 200) {
          const projectsData = response.data.projects.map((project, index) => {
            let lastMessageText = "No messages yet";
            if (project.last_message) {
              const senderName = project.last_sender || "Unknown";
              const isCurrentUser = project.last_sender === data?.employee_id;
              const senderDisplay = isCurrentUser
                ? "You"
                : senderName.split(" ")[0];
              lastMessageText = `${senderDisplay}: ${project.last_message}`;
            }

            return {
              project_id: project.project_id,
              project_name: project.project_name,
              status: project.status,
              type: "group",
              unread: project.unread_messages || 0,
              isOnline: false,
              lastMessage: lastMessageText,
              timestamp: project.last_message_time
                ? getTimeAgo(project.last_message_time)
                : "",
              members: project.members || [],
              messages: project.messages || [],
              avatarColor: avatarColors[index % avatarColors.length],
              groupAvatar: getProjectInitials(project.project_name),
              last_message_time: project.last_message_time,
              last_sender: project.last_sender,
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
  }, [token, data?.employee_id, getTimeAgo, getProjectInitials]);

  // 🔥 MERGE projectSummary from AuthContext into projects state
  useEffect(() => {
    if (!projectSummary || Object.keys(projectSummary).length === 0) return;

    setProjects((prevProjects) => {
      let updated = false;
      const newProjects = prevProjects.map((project) => {
        const summary = projectSummary[project.project_id];
        if (!summary) return project;

        updated = true;
        const isCurrentUser = summary.last_sender_code === data?.employee_id;
        const senderDisplay = isCurrentUser
          ? "You"
          : (summary.last_sender || "Unknown").split(" ")[0];

        return {
          ...project,
          unread: Number(summary?.unread?.[data.employee_id] || 0),

          lastMessage: summary.last_message
            ? `${senderDisplay}: ${summary.last_message}`
            : project.lastMessage,
          timestamp: summary.last_message_time
            ? getTimeAgo(summary.last_message_time)
            : project.timestamp,
          last_message_time:
            summary.last_message_time || project.last_message_time,
          last_sender: summary.last_sender || project.last_sender,
        };
      });

      return updated ? newProjects : prevProjects;
    });
  }, [projectSummary, data?.employee_id, getTimeAgo]);

  // Filter projects based on search
  const filteredProjects = projects.filter(
    (project) =>
      project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.members.some((member) =>
        member.employee_name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  // Mark project messages as read
  const markProjectMessagesAsRead = useCallback(
    async (projectId) => {
      if (!projectId || !data?.employee_id) return;

      try {
        setMarkingAsRead(true);
        const response = await axios.post(
          `${api_url}/project/chat/read`,
          {
            project_id: projectId,
            employee_id: data.employee_id,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        console.log("unread response:: ", response);
        if (response.data.status === 1) {
          // setTotalUnreadMessages(0);
          console.log(
            `✅ Marked ${response.data.read_count} messages as read for project ${projectId}`,
          );
          return response.data.read_count;
        }
      } catch (error) {
        console.error("Error marking messages as read:", error);
      } finally {
        setMarkingAsRead(false);
      }
      return 0;
    },
    [api_url, token, data?.employee_id],
  );

  // Handle project selection
  const handleProjectSelect = useCallback(
    async (project) => {
      // Mark messages as read for this project - backend updates Firebase
      // if (project.unread > 0) {
      await markProjectMessagesAsRead(project.project_id);
      // DO NOT manually update unread counts - wait for projectSummary to update
      // }

      setSelectedProject({
        ...project,
        unread: 0,
      });

      setProjects((prev) =>
        prev.map((p) =>
          p.project_id === project.project_id ? { ...p, unread: 0 } : p,
        ),
      );

      if (isMobileView) {
        setShowChat(true);
      }
    },
    [markProjectMessagesAsRead, isMobileView],
  );

  // Handle back to project list on mobile
  const handleBackToProjects = useCallback(() => {
    setShowChat(false);
    setSelectedProject(null);
    setReplyingTo(null);
    setEditingMessage(null);
    setAttachments([]);
  }, []);

  // Refresh messages for a specific project (REST API)
  const refreshProjectMessages = useCallback(
    async (projectId) => {
      try {
        const response = await axios.get(
          `${api_url}/projects/members/${projectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { t: Date.now() },
          },
        );

        if (response.data.status === 200) {
          const messages = response.data.data.posts || [];

          if (selectedProject?.project_id === projectId) {
            setSelectedProject((prev) => ({
              ...prev,
              messages: messages,
            }));
          }

          setProjects((prev) =>
            prev.map((project) => {
              if (project.project_id === projectId) {
                const lastMessage =
                  messages.length > 0 ? messages[messages.length - 1] : null;
                let lastMessageText = project.lastMessage;
                let lastMessageTime = project.timestamp;

                if (lastMessage) {
                  const isCurrentUser =
                    lastMessage.employee_code === data?.employee_id;
                  const senderDisplay = isCurrentUser
                    ? "You"
                    : lastMessage.user_name?.split(" ")[0] || "Unknown";
                  const messagePreview =
                    lastMessage.message?.substring(0, 30) +
                    (lastMessage.message?.length > 30 ? "..." : "");
                  lastMessageText = `${senderDisplay}: ${messagePreview}`;
                  lastMessageTime = getTimeAgo(lastMessage.created_at);
                }

                return {
                  ...project,
                  messages: messages,
                  lastMessage: lastMessageText,
                  timestamp: lastMessageTime,
                };
              }
              return project;
            }),
          );
        }
      } catch (error) {
        console.error("Error refreshing messages:", error);
      }
    },
    [
      api_url,
      token,
      selectedProject?.project_id,
      data?.employee_id,
      getTimeAgo,
    ],
  );

  // Handle sending message
  const handleSendMessage = useCallback(async () => {
    if ((!messageText.trim() && attachments.length === 0) || !selectedProject)
      return;

    setSendingMessage(true);
    try {
      const formData = new FormData();
      formData.append("project_id", selectedProject.project_id);

      if (editingMessage) {
        formData.append("title", messageText.trim());
        const response = await axios.put(
          `${api_url}/project-posts/${editingMessage.id}`,
          { title: messageText.trim() },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (response.status === 200) {
          await refreshProjectMessages(selectedProject.project_id);
          setEditingMessage(null);
          setMessageText("");
          setAttachments([]);
        }
      } else {
        formData.append("title", messageText.trim());
        if (replyingTo) {
          formData.append("parent_id", replyingTo.id);
        }
        attachments.forEach((attachment) => {
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
  }, [
    messageText,
    attachments,
    selectedProject,
    editingMessage,
    replyingTo,
    api_url,
    token,
    refreshProjectMessages,
  ]);

  // Handle edit message
  const handleEditMessage = useCallback((message) => {
    setEditingMessage(message);
    setReplyingTo(null);
    setMessageText(message.message || message.title || "");
    inputRef.current?.focus();
  }, []);

  // Handle reply to message
  const handleReplyToMessage = useCallback((message) => {
    setReplyingTo(message);
    setEditingMessage(null);
    inputRef.current?.focus();
  }, []);

  // Handle delete message
  const handleDeleteMessage = useCallback(
    async (messageId) => {
      if (!window.confirm("Are you sure you want to delete this message?"))
        return;

      try {
        const response = await axios.delete(
          `${api_url}/project-posts/${messageId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (response.status === 200) {
          await refreshProjectMessages(selectedProject.project_id);
        }
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    },
    [api_url, token, selectedProject?.project_id, refreshProjectMessages],
  );

  // Handle key press (Enter to send)
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  // Handle project avatar/name click
  const handleProjectClick = useCallback(() => {
    if (selectedProject?.type === "group") {
      setShowProjectDetails(true);
    }
  }, [selectedProject]);

  // Handle file selection
  const handleFileSelect = useCallback((e) => {
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
  }, []);

  // Remove attachment
  const handleRemoveAttachment = useCallback((id) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  }, []);

  // Cancel reply or edit
  const handleCancelAction = useCallback(() => {
    setReplyingTo(null);
    setEditingMessage(null);
    setMessageText("");
  }, []);

  // Check if message is from current user
  const isMessageFromCurrentUser = useCallback(
    (message) => {
      return message.employee_code === data?.employee_id;
    },
    [data?.employee_id],
  );

  // Get input placeholder text
  const getInputPlaceholder = useCallback(() => {
    if (editingMessage) return "Edit your message...";
    if (replyingTo)
      return `Reply to ${replyingTo.employee_name || replyingTo.employee_code}...`;
    return `Message in ${selectedProject?.project_name || "project"}...`;
  }, [editingMessage, replyingTo, selectedProject]);

  // 🔥 FIREBASE CHAT LISTENER - Only when a project is opened
  useEffect(() => {
    // Clean up previous listener
    if (unsubscribeChatRef.current) {
      unsubscribeChatRef.current();
      unsubscribeChatRef.current = null;
    }

    if (!selectedProject?.project_id) return;

    const unsubscribe = listenProjectMessages(
      selectedProject.project_id,
      (firebaseMessage) => {
        console.log("📨 Firebase Project Message:", firebaseMessage);

        const transformedMessage = {
          id: firebaseMessage.id,
          message: firebaseMessage.message,
          employee_code: firebaseMessage.employee_code,
          user_name: firebaseMessage.employee_name,
          created_at: firebaseMessage.created_at,
          project_id: firebaseMessage.project_id,
          parent_id: firebaseMessage.parent_id,
          replies: firebaseMessage.replies || null,
        };

        // Append message to selected project - NO duplicate checking via ID
        setSelectedProject((prev) => {
          if (!prev) return prev;
          // Check if message already exists
          const exists = prev.messages.some(
            (msg) => msg.id === transformedMessage.id,
          );
          if (exists) return prev;
          return {
            ...prev,
            messages: [...prev.messages, transformedMessage],
          };
        });

        // 🔥 ONLY update last message in sidebar - NO unread badge update here
        // projectSummary will handle unread updates
        setProjects((prev) =>
          prev.map((project) => {
            if (project.project_id === firebaseMessage.project_id) {
              const senderName = firebaseMessage.employee_name || "Unknown";
              const isCurrentUser =
                firebaseMessage.employee_code === data?.employee_id;
              const senderDisplay = isCurrentUser
                ? "You"
                : senderName.split(" ")[0];
              return {
                ...project,
                lastMessage: `${senderDisplay}: ${firebaseMessage.message}`,
                timestamp: getTimeAgo(firebaseMessage.created_at),
                // DO NOT update unread here - projectSummary handles it
              };
            }
            return project;
          }),
        );
      },
    );

    unsubscribeChatRef.current = unsubscribe;

    return () => {
      if (unsubscribeChatRef.current) {
        unsubscribeChatRef.current();
        unsubscribeChatRef.current = null;
      }
    };
  }, [selectedProject?.project_id, data?.employee_id, getTimeAgo]);

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

  // Set selected project based on URL parameter
  useEffect(() => {
    // Wait until projects are loaded
    if (!projectId || projects.length === 0) return;

    // Don't select again if already selected
    if (
      selectedProject &&
      String(selectedProject.project_id) === String(projectId)
    ) {
      return;
    }

    const project = projects.find(
      (p) => String(p.project_id) === String(projectId),
    );

    if (project) {
      console.log("📩 Auto opening project:", project.project_name);

      handleProjectSelect(project);
    }
  }, [projectId, projects, selectedProject, handleProjectSelect]);

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
                        {member.employee_id === data?.employee_id && (
                          <span className="you-badge">You</span>
                        )}
                      </div>
                      <div className="member-code">{member.employee_id}</div>
                    </div>
                    <div className="member-role">{member.role_name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      <div
        className={`message-sidebar ${isMobileView && showChat ? "hidden" : ""}`}
      >
        <div className="sidebar-header">
          <h2>Project Messages</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {totalUnreadMessages > 0 && (
              <span
                style={{
                  background: "rgba(255, 255, 255, 0.3)",
                  color: "white",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                {totalUnreadMessages} unread
              </span>
            )}
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
                className={`contact-item ${selectedProject?.project_id === project.project_id ? "active" : ""}`}
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

      {/* Right Chat Area */}
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
            {/* Chat Header */}
            <div className="chat-header">
              {isMobileView && (
                <div
                  className="back-button-chat"
                  onClick={handleBackToProjects}
                >
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
                  <h3 style={{ margin: 0, fontSize: "16px", color: "#ffffff" }}>
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
                        className={`message ${isCurrentUser ? "sent" : "received"}`}
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
                                    "_blank",
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
                                    {reply.employee_name || reply.employee_code}
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
                          {replyingTo.employee_name || replyingTo.employee_code}
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
                  ) : (
                    <FontAwesomeIcon icon={faCircleUp} />
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

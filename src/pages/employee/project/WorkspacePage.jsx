import React, {
  useContext,
  useMemo,
  useEffect,
  useState,
  useRef,
  useCallback,
  memo,
} from "react";

import axios from "axios";

import { toast } from "react-toastify";

import "./WorkspacePage.css";

import { WorkspaceContext } from "../../../context/WorkspaceContext";

import { useNavigate, useParams } from "react-router-dom";

import { AuthContext } from "../../../context/AuthContex";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCalendarAlt,
  faUser,
  faUsers,
  faClock,
  faCheckCircle,
  faExclamationCircle,
  faFileAlt,
  faPaperclip,
  faDownload,
  faEye,
  faComment,
  faListCheck,
  faChartSimple,
  faUserPlus,
  faEnvelope,
  faPhone,
  faTag,
  faLayerGroup,
  faIdCard,
  faCalendarDay,
  faUpload,
  faReply,
  faTrashAlt,
  faPaperPlane,
  faTimes,
  faImage,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileArchive,
  faFile,
  faCheck,
  faCheckDouble,
  faSmile,
  faEllipsisV,
  faSpinner,
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { listenMessages } from "../../../service/chatService";

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

const getFileType = (filename) => {
  if (!filename) return "File";
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "PDF";
  if (ext === "doc" || ext === "docx") return "Word Document";
  if (ext === "xls" || ext === "xlsx") return "Excel Spreadsheet";
  if (ext === "ppt" || ext === "pptx") return "PowerPoint";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "Image";
  if (ext === "zip" || ext === "rar" || ext === "7z") return "Archive";
  return "File";
};

const getFileSize = (filename, fileSize) => {
  if (fileSize) {
    if (fileSize < 1024) return `${fileSize} B`;
    if (fileSize < 1048576) return `${(fileSize / 1024).toFixed(1)} KB`;
    return `${(fileSize / 1048576).toFixed(1)} MB`;
  }
  return "";
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
// MESSAGE BUBBLE COMPONENT
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
              {comment.employee_role && (
                <span
                  className={`sender-role role-${comment.employee_role.role_name?.toLowerCase()}`}
                >
                  {comment.employee_role.role_name}
                </span>
              )}
            </div>
          )}

          <div
            className={`message-bubble ${isOwnMessage ? "bubble-own" : "bubble-other"}`}
          >
            {/* Reply context — shown when this message is a reply */}
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
  },
);

// ========================================
// MAIN COMPONENT
// ========================================

const WorkspacePage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { token, data } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;
  const STORAGE_URL = import.meta.env.VITE_STORAGE_URL;
  const { selectedItem, treeData, setSelectedItem } =
    useContext(WorkspaceContext);

  // ========================================
  // STATES
  // ========================================

  const [detailsLoading, setDetailsLoading] = useState(false);
  const [workspaceDetails, setWorkspaceDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [remarks, setRemarks] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newCommentFile, setNewCommentFile] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);
  const replyInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  // const getActionConfig = () => {
  //   switch (selectedItem?.type) {
  //     case "module":
  //       return {
  //         createLabel: "Create Submodule",
  //         createType: "submodule",

  //         assignLabel: "Assign Module",
  //         assignType: "module",
  //       };
  //     case "submodule":
  //       return {
  //         createLabel: "Create Task",
  //         assignLabel: "Assign Submodule",
  //         createType: "task",
  //         assignType: "submodule",
  //       };
  //     case "task":
  //       return {
  //         createLabel: "Create Subtask",
  //         assignLabel: "Assign Task",
  //         createType: "subtask",
  //         assignType: "task",
  //       };
  //     case "subtask":
  //       return {
  //         createLabel: "Submit Work",
  //         assignLabel: "Assign Subtask",
  //         createType: null,
  //         assignType: "subtask",
  //       };
  //     default:
  //       return {};
  //   }
  // };

  const getActionConfig = () => {
    switch (selectedItem?.type) {
      case "module":
        return {
          createSame: {
            label: "Create Module",
            type: "module",
            permission: "create_module",
          },
          createChild: {
            label: "Create Submodule",
            type: "submodule",
            permission: "create_submodule",
          },
          assign: {
            label: "Assign Module",
            type: "module",
            permission: "assign_module",
          },
        };

      case "submodule":
        return {
          createSame: {
            label: "Create Submodule",
            type: "submodule",
            permission: "create_submodule",
          },
          createChild: {
            label: "Create Task",
            type: "task",
            permission: "create_task",
          },
          assign: {
            label: "Assign Submodule",
            type: "submodule",
            permission: "assign_submodule",
          },
        };

      case "task":
        return {
          createSame: {
            label: "Create Task",
            type: "task",
            permission: "create_task",
          },
          createChild: {
            label: "Create Subtask",
            type: "subtask",
            permission: "create_subtask",
          },
          assign: {
            label: "Assign Task",
            type: "task",
            permission: "assign_task",
          },
        };

      case "subtask":
        return {
          createSame: null,
          createChild: null,
          assign: {
            label: "Assign Subtask",
            type: "subtask",
            permission: "assign_subtask",
          },
        };

      default:
        return {};
    }
  };

  const permissions = workspaceDetails?.current_user_permissions || [];

  const hasPermission = (permissionName) => {
    return permissions.some((item) => item.permission_name === permissionName);
  };

  const canCreate = () => {
    switch (selectedItem?.type) {
      case "module":
        return (
          hasPermission("create_submodule") || hasPermission("create_task")
        );

      case "submodule":
        return hasPermission("create_task");

      case "task":
        return hasPermission("create_subtask");

      case "subtask":
        return false;

      default:
        return false;
    }
  };
  const canCreateSameLevel = () => {
    switch (selectedItem?.type) {
      case "module":
        return hasPermission("create_module");

      case "submodule":
        return hasPermission("create_submodule");

      case "task":
        return hasPermission("create_task");

      default:
        return false;
    }
  };

  const canCreateChildLevel = () => {
    switch (selectedItem?.type) {
      case "module":
        return hasPermission("create_submodule");

      case "submodule":
        return hasPermission("create_task");

      case "task":
        return hasPermission("create_subtask");

      default:
        return false;
    }
  };

  // const canAssign = () => {
  //   switch (selectedItem?.type) {
  //     case "module":
  //       return hasPermission("assign_module");

  //     case "submodule":
  //       return hasPermission("assign_submodule");

  //     case "task":
  //       return hasPermission("assign_task");

  //     case "subtask":
  //       return hasPermission("assign_subtask");

  //     default:
  //       return false;
  //   }
  // };

  const actionConfig = getActionConfig();

  const canCreateSame = () =>
    actionConfig.createSame &&
    hasPermission(actionConfig.createSame.permission);

  const canCreateChild = () =>
    actionConfig.createChild &&
    hasPermission(actionConfig.createChild.permission);

  const canAssign = () =>
    actionConfig.assign && hasPermission(actionConfig.assign.permission);

  const canCreateSubmission = hasPermission("create_submission");
  const canViewSubmission = hasPermission("view_submission");

  const canAccessSubmission = canCreateSubmission || canViewSubmission;

  const findPath = (tree, targetId, path = []) => {
    for (const item of tree) {
      const newPath = [...path, item];
      if (item.id === targetId) return newPath;
      if (item.children?.length) {
        const found = findPath(item.children, targetId, newPath);
        if (found) return found;
      }
    }
    return null;
  };

  const getTabs = () => {
    if (!selectedItem) return [];

    if (selectedItem.type === "module" || selectedItem.type === "submodule") {
      return [
        { id: "overview", label: "Overview", icon: faChartSimple },
        { id: "assignedEmployees", label: "Team Members", icon: faUsers },
        { id: "comments", label: "Discussion", icon: faComment },
      ];
    }

    if (selectedItem.type === "task" || selectedItem.type === "subtask") {
      return [
        { id: "overview", label: "Overview", icon: faChartSimple },
        { id: "assignedEmployees", label: "Team Members", icon: faUsers },
        {
          id: "remarkForm",
          label: "Submit Work",
          icon: faUpload,
          disabled: !canCreateSubmission,
        },
        {
          id: "remarksHistory",
          label: "Work History",
          icon: faListCheck,
          disabled: !canViewSubmission,
        },
        { id: "comments", label: "Discussion", icon: faComment },
      ];
    }

    return [];
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return {
          color: "#ff902f",
          bg: "#fff3e0",
          icon: faClock,
          label: "Open",
        };
      case "in-progress":
        return {
          color: "#3b82f6",
          bg: "#eff6ff",
          icon: faClock,
          label: "In Progress",
        };
      case "completed":
        return {
          color: "#10b981",
          bg: "#dcfce7",
          icon: faCheckCircle,
          label: "Completed",
        };
      default:
        return {
          color: "#6b7280",
          bg: "#f3f4f6",
          icon: faExclamationCircle,
          label: status || "Unknown",
        };
    }
  };

  // ── Flat sort by date — no tree nesting needed ──
  const sortCommentsByDate = (commentsList) => {
    return [...commentsList].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at),
    );
  };

  // ── Group flat sorted comments by calendar date ──
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

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  // ========================================
  // MEMOIZED VALUES
  // ========================================

  const breadcrumb = useMemo(() => {
    if (!selectedItem) return [];
    return findPath(treeData, selectedItem.id) || [];
  }, [selectedItem, treeData]);

  const tabs = getTabs();

  // Flat sorted list — no tree building
  const sortedComments = useMemo(
    () => sortCommentsByDate(comments),
    [comments],
  );

  // Group the flat list by date for date dividers
  const groupedComments = useMemo(
    () => groupCommentsByDate(sortedComments),
    [sortedComments],
  );

  const currentUserId = data?.employee_id;
  const employeeName = data?.employee_name;
  const employeeId = data?.employee_id;

  // ========================================
  // API CALLS
  // ========================================

  const getWorkspaceDetails = async () => {
    if (!selectedItem?.id) return;
    try {
      setDetailsLoading(true);
      const response = await axios.get(
        `${api_url}/module-details/${selectedItem.id}/${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setWorkspaceDetails(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchComments = useCallback(async () => {
    if (!selectedItem?.id || !projectId) return;
    try {
      setCommentsLoading(true);
      const response = await axios.get(
        `${api_url}/work-item-comment/${projectId}/${selectedItem.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
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
  }, [selectedItem?.id, projectId, token]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleSubmitRemarks = async () => {
    if (!remarks.trim()) {
      toast.error("Please enter remarks");
      return;
    }
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("work_item_id", selectedItem.id);
      formData.append("remarks", remarks);
      if (selectedFile) formData.append("file", selectedFile);

      const response = await axios.post(
        `${api_url}/task-completed-remarks`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (response.data.status === 1) {
        toast.success("Task marked completed successfully!");
        setRemarks("");
        setSelectedFile(null);
        getWorkspaceDetails();
      }
    } catch (error) {
      console.log(error);
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() && !newCommentFile) {
      toast.error("Please enter a message or attach a file");
      return;
    }
    try {
      setSubmittingComment(true);
      const formData = new FormData();
      formData.append("project_id", projectId);
      formData.append("work_item_id", selectedItem.id);
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
        },
      );

      if (response.data.status === 1) {
        toast.success(replyTo ? "Reply sent!" : "Message sent!");
        setNewComment("");
        setNewCommentFile(null);
        setReplyTo(null);
        setShowEmojiPicker(false);
        // await fetchComments();
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

  const handleDeleteComment = useCallback(
    async (commentId) => {
      if (!window.confirm("Are you sure you want to delete this message?"))
        return;
      try {
        setDeletingCommentId(commentId);
        const response = await axios.delete(
          `${api_url}/work-item-comment/delete/${commentId}`,
          { headers: { Authorization: `Bearer ${token}` } },
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
    [api_url, token, fetchComments],
  );

  const handleReplyClick = useCallback((comment) => {
    setReplyTo(comment);
    setTimeout(() => replyInputRef.current?.focus(), 100);
  }, []);

  const handleEmojiClick = (emoji) => {
    setNewComment((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

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
  // EFFECTS
  // ========================================

  useEffect(() => {
    if (!selectedItem?.id) return;

    const unsubscribe = listenMessages(selectedItem.id, (newMessage) => {
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
  }, [selectedItem?.id]);

  useEffect(() => {
    getWorkspaceDetails();
  }, [selectedItem]);

  useEffect(() => {
    if (activeTab === "comments") {
      fetchComments();
    }
  }, [activeTab, selectedItem, projectId]);
  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ========================================
  // CONDITIONAL RETURNS
  // ========================================

  if (!selectedItem) {
    return (
      <div className="workspace-main">
        <div className="empty-workspace">
          <div className="empty-icon">📁</div>
          <h2>Select Any Item</h2>
          <p>
            Click any module, submodule, task or subtask from sidebar to view
            details.
          </p>
        </div>
      </div>
    );
  }

  if (detailsLoading) {
    return (
      <div className="workspace-main">
        <div className="premium-loading">
          <div className="loading-spinner"></div>
          <p>Loading Details...</p>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(workspaceDetails?.details?.status);
  const details = workspaceDetails?.details;

  // Get the full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `${STORAGE_URL}${imagePath}`;
  };

  // Check if file is an image
  const isImageFile = (filename) => {
    if (!filename) return false;
    const ext = filename.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
  };

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <div className="workspace-main">
      {/* TOP ACTIONS */}
      <div className="workspace-top-actions">
        <button
          className="back-project-btn"
          onClick={() => navigate("/organization/assigned-project")}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Projects
        </button>
      </div>

      {/* BREADCRUMB */}
      <div className="breadcrumb-premium">
        <div className="breadcrumb-home">
          <span>📁</span>
        </div>
        {breadcrumb.map((item, index) => (
          <div key={item.id} className="breadcrumb-link">
            <button onClick={() => setSelectedItem(item)}>{item.title}</button>
            {index < breadcrumb.length - 1 && (
              <span className="breadcrumb-separator">/</span>
            )}
          </div>
        ))}
      </div>

      {/* TABS */}
      <div className="workspace-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            disabled={tab.disabled}
            className={`
    ${activeTab === tab.id ? "active-tab" : ""}
    ${tab.disabled ? "disabled-tab" : ""}
  `}
            onClick={() => {
              if (!tab.disabled) {
                setActiveTab(tab.id);
              }
            }}
          >
            <FontAwesomeIcon icon={tab.icon} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="workspace-tab-content">
        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="tab-card">
            <div className="tab-header">
              <h3>
                <FontAwesomeIcon icon={faChartSimple} />
                Overview
              </h3>
            </div>
            <div className="overview-grid">
              {/* Status */}
              <div className="overview-item">
                <span className="overview-label">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Status
                </span>

                <div className="overview-value">
                  <div
                    className="status-indicator"
                    style={{ background: statusConfig.color }}
                  />
                  {statusConfig.label}
                </div>
              </div>

              {/* Priority */}
              <div className="overview-item">
                <span className="overview-label">
                  <FontAwesomeIcon icon={faTag} />
                  Priority
                </span>

                <div
                  className={`priority-badge priority-${details?.priority?.toLowerCase()}`}
                >
                  {details?.priority || "N/A"}
                </div>
              </div>

              {/* Start Date */}
              <div className="overview-item">
                <span className="overview-label">
                  <FontAwesomeIcon icon={faCalendarDay} />
                  Start Date
                </span>

                <div className="overview-value">
                  {formatDate(details?.start_date)}
                </div>
              </div>

              {/* End Date */}
              <div className="overview-item">
                <span className="overview-label">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  End Date
                </span>

                <div className="overview-value">
                  {formatDate(details?.end_date)}
                </div>
              </div>
            </div>

            {/* ── FILE ATTACHMENT DISPLAY ── */}
            {details?.image && (
              <div className="file-attachment-section">
                <div className="file-attachment-header">
                  <FontAwesomeIcon icon={faPaperclip} />
                  <span>Attached File</span>
                </div>
                <div className="file-attachment-card">
                  <div className="file-attachment-icon">
                    <FontAwesomeIcon icon={getFileIcon(details.image)} />
                  </div>
                  <div className="file-attachment-info">
                    {/* <div className="file-attachment-name">
                      {details.image.split("/").pop()}
                    </div> */}
                    <div className="file-attachment-details">
                      <span className="file-type-badge">
                        {getFileType(details.image)}
                      </span>
                    </div>
                  </div>
                  <a
                    href={getFullImageUrl(details.image)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="file-download-btn"
                  >
                    <FontAwesomeIcon icon={faDownload} />
                    <span>Download</span>
                  </a>
                </div>
                {/* Image Preview for image files */}
                {isImageFile(details.image) && (
                  <div className="file-image-preview-container">
                    <img
                      src={getFullImageUrl(details.image)}
                      alt="Attachment preview"
                      className="file-image-preview-full"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="workspace-action-buttons">
              {/* SUBTASK BUTTONS */}
              {selectedItem.type === "subtask" ? (
                <>
                  <button
                    className="workspace-assign-btn"
                    onClick={() => setActiveTab("comments")}
                  >
                    <FontAwesomeIcon icon={faComment} />
                    View Discussion
                  </button>

                  {canAssign() && (
                    <button
                      className="workspace-assign-btn"
                      onClick={() =>
                        navigate(
                          `/organization/emp-assign-work-item/${projectId}?workitem_id=${selectedItem.id}&type=${actionConfig.assign.type}`,
                        )
                      }
                    >
                      <FontAwesomeIcon icon={faUsers} />
                      {actionConfig.assign.label}
                    </button>
                  )}
                </>
              ) : (
                <>
                  {canCreateSame() && (
                    <button
                      className="workspace-create-btn"
                      onClick={() =>
                        navigate(
                          `/organization/emp-add-module/${projectId}?workitem_id=${selectedItem.id}&type=${actionConfig.createSame.type}`,
                        )
                      }
                    >
                      <FontAwesomeIcon icon={faLayerGroup} />
                      {actionConfig.createSame.label}
                    </button>
                  )}

                  {canCreateChild() && (
                    <button
                      className="workspace-create-btn"
                      onClick={() =>
                        navigate(
                          `/organization/emp-add-module/${projectId}?workitem_id=${selectedItem.id}&type=${actionConfig.createChild.type}`,
                        )
                      }
                    >
                      <FontAwesomeIcon icon={faLayerGroup} />
                      {actionConfig.createChild.label}
                    </button>
                  )}

                  {canAssign() && (
                    <button
                      className="workspace-assign-btn"
                      onClick={() =>
                        navigate(
                          `/organization/emp-assign-work-item/${projectId}?workitem_id=${selectedItem.id}&type=${actionConfig.assign.type}`,
                        )
                      }
                    >
                      <FontAwesomeIcon icon={faUsers} />
                      {actionConfig.assign.label}
                    </button>
                  )}
                </>
              )}
            </div>

            {details?.description && (
              <div className="description-box">
                <h4>
                  <FontAwesomeIcon icon={faFileAlt} />
                  Description
                </h4>
                <p dangerouslySetInnerHTML={{ __html: details.description }} />
              </div>
            )}
          </div>
        )}

        {/* ── TEAM MEMBERS ── */}
        {/* ── TEAM MEMBERS ── */}
        {activeTab === "assignedEmployees" && (
          <div className="tab-card">
            <div className="tab-header">
              <h3>
                <FontAwesomeIcon icon={faUsers} />
                Team Members
              </h3>
              <span className="member-count">
                {workspaceDetails?.employee_count} Members
              </span>
            </div>
            <div className="employee-table-container">
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Role</th>
                    {/* <th>Status</th> */}
                    <th>Assigned By</th>
                    <th>Assigned At</th>
                  </tr>
                </thead>
                <tbody>
                  {workspaceDetails?.employees?.length > 0 ? (
                    workspaceDetails.employees.map((emp, index) => (
                      <tr key={emp.employee_id} className="employee-row">
                        <td className="serial-number">{index + 1}</td>
                        <td className="employee-info-cell">
                          <div className="employee-info-wrapper">
                            <div className="employee-avatar-small-table">
                              {emp.employee_name?.charAt(0) || "U"}
                            </div>
                            <div className="employee-details">
                              <span className="employee-name-table">
                                {emp.employee_name}
                              </span>
                              <span className="employee-email-hint">
                                {emp.employee_id?.toLowerCase()}@company.com
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="employee-id-cell">
                          <code>{emp.employee_id}</code>
                        </td>
                        <td className="role-cell">
                          <span
                            className={`role-badge role-${emp.role_name?.toLowerCase() || "member"}`}
                          >
                            {emp.role_name || "Member"}
                          </span>
                        </td>
                        {/* <td className="status-cell">
                          {emp.status ? (
                            <span
                              className={`status-badge-table ${emp.status === "assigned" ? "active" : "inactive"}`}
                            >
                              <span className="status-dot"></span>
                              {emp.status.charAt(0).toUpperCase() +
                                emp.status.slice(1)}
                            </span>
                          ) : (
                            <span className="status-badge-table inactive">
                              <span className="status-dot"></span>
                              Pending
                            </span>
                          )}
                        </td> */}
                        <td className="assigned-by-cell">
                          {emp.assigned_by_name ? (
                            <div className="assigned-by-info">
                              <span className="assigned-by-name">
                                {emp.assigned_by_name}
                              </span>
                              <span className="assigned-by-id">
                                ({emp.assigned_by})
                              </span>
                            </div>
                          ) : (
                            <span className="not-assigned-text">—</span>
                          )}
                        </td>
                        <td className="assigned-at-cell">
                          {emp.assigned_at ? (
                            <span className="assigned-at-time">
                              {new Date(emp.assigned_at).toLocaleString()}
                            </span>
                          ) : (
                            <span className="not-assigned-text">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="empty-table-row">
                        <div className="empty-state-small">
                          <FontAwesomeIcon icon={faUserPlus} />
                          <p>No team members assigned yet</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* ── REMARK FORM ── */}
        {activeTab === "remarkForm" && (
          <div className="tab-card">
            <div className="tab-header">
              <h3>
                <FontAwesomeIcon icon={faUpload} />
                Submit Work Report
              </h3>
            </div>
            <div className="remark-form">
              <div className="form-group">
                <label>Work Details / Remarks</label>
                <textarea
                  placeholder="Describe the work completed, challenges faced, and any important notes..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows="5"
                />
              </div>
              <div className="form-group">
                <label>Attachment (Optional)</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    id="file-upload"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    hidden
                  />
                  <label htmlFor="file-upload" className="file-upload-label">
                    <FontAwesomeIcon icon={faPaperclip} />
                    {selectedFile ? selectedFile.name : "Click to upload file"}
                  </label>
                  {selectedFile && (
                    <button
                      className="clear-file-btn"
                      onClick={() => setSelectedFile(null)}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <button
                className="submit-remark-btn"
                onClick={handleSubmitRemarks}
                disabled={submitting || !remarks.trim()}
              >
                {submitting ? "Submitting..." : "Submit Work Report"}
              </button>
            </div>
          </div>
        )}

        {/* ── REMARKS HISTORY ── */}
        {activeTab === "remarksHistory" && (
          <div className="tab-card">
            <div className="tab-header">
              <h3>
                <FontAwesomeIcon icon={faListCheck} />
                Work History
              </h3>
              <span className="history-count">
                {workspaceDetails?.submissions?.length || 0} Entries
              </span>
            </div>
            <div className="remarks-list">
              {workspaceDetails?.submissions?.length > 0 ? (
                workspaceDetails.submissions.map((item, index) => (
                  <div key={item.id} className="remark-item">
                    <div className="remark-timeline">
                      <div className="timeline-dot"></div>
                      {index < workspaceDetails.submissions.length - 1 && (
                        <div className="timeline-line"></div>
                      )}
                    </div>
                    <div className="remark-content">
                      <div className="remark-header">
                        <div className="remark-user">
                          <div className="user-avatar-small">
                            {item.employee_name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <h4>{item.employee_name}</h4>
                            <span className="user-id">{item.employee_id}</span>
                          </div>
                        </div>
                        <span className="remark-date">
                          <FontAwesomeIcon icon={faClock} />
                          {new Date(item.submitted_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="remark-text">{item.remarks}</p>
                      {item.file && (
                        <a
                          href={`${STORAGE_URL}/${item.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="remark-file"
                        >
                          <FontAwesomeIcon icon={faDownload} />
                          View Attachment
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state-small">
                  <FontAwesomeIcon icon={faFileAlt} />
                  <p>No work history available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── COMMENTS — WhatsApp flat style ── */}
        {activeTab === "comments" && (
          <div className="tab-card comments-whatsapp-container">
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-info">
                <FontAwesomeIcon
                  icon={faComment}
                  className="chat-header-icon"
                />
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
                  <FontAwesomeIcon icon={getFileIcon(newCommentFile.name)} />
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
                      <button
                        key={emoji}
                        onClick={() => handleEmojiClick(emoji)}
                      >
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
                  <label
                    htmlFor="chat-file"
                    className="chat-attach-btn"
                    title="Attach file"
                  >
                    <FontAwesomeIcon icon={faPaperclip} />
                  </label>
                </div>

                <button
                  className="chat-send-btn"
                  onClick={handleSubmitComment}
                  disabled={
                    submittingComment || (!newComment.trim() && !newCommentFile)
                  }
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
        )}
      </div>
    </div>
  );
};

export default WorkspacePage;

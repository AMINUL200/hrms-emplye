import React, { useContext, useEffect, useState } from "react";
import "./ViewProjectPage.css";
import { Paperclip } from "lucide-react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContex";
import { toast } from "react-toastify";
import PageLoader from "../../../component/loader/PageLoader";
import axios from "axios";
import OverviewComponent from "../../../component/task/OverviewTab";
import TasksComponent from "../../../component/task/TasksTab";

const ViewProjectPage = () => {
  const { id } = useParams();
  const { token, data } = useContext(AuthContext);
  const api_url = import.meta.env.VITE_API_URL;
  const stor_url = import.meta.env.VITE_STORAGE_URL;
  const [loading, setLoading] = useState(true);
  const [handleSendMessageLoading, setHandleSendMessageLoading] =
    useState(false);

  const [handleAddTaskCommentLoading, setHandleAddTaskCommentLoading] =
    useState(false);

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [taskComment, setTaskComment] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);

  // Message enhancement states
  const [showAttachmentPopup, setShowAttachmentPopup] = useState(false);
  const [selectedAttachmentType, setSelectedAttachmentType] = useState("");
  const [messageAttachments, setMessageAttachments] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");

  // Task menu states
  const [showTaskMenu, setShowTaskMenu] = useState(false);
  const [selectedTaskForMenu, setSelectedTaskForMenu] = useState(null);
  const [showStatusChangePopup, setShowStatusChangePopup] = useState(false);
  const [showMoveTaskPopup, setShowMoveTaskPopup] = useState(false);
  const [messagesEndRef, setMessagesEndRef] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

  // Drag and drop states
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // State for project data from API
  const [projectData, setProjectData] = useState({
    project: {},
    members: [],
    posts: [],
  });

  // State for tasks from API - now dynamic
  const [tasks, setTasks] = useState({});
  const [taskColumns, setTaskColumns] = useState([]); // Store column names dynamically

  const getProjectData = async () => {
    try {
      const response = await axios.get(`${api_url}/projects/members/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          t: Date.now(), // prevent caching
        },
      });

      if (response.data.status === 200) {
        const data = response.data.data;
        setProjectData({
          project: data.project.project,
          members: data.project.members || [],
          posts: data.posts || [],
        });
      } else {
        toast.error("Failed to fetch project data");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getTaskData = async () => {
    try {
      const response = await axios.get(`${api_url}/project-wise-task/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          t: Date.now(), // prevent caching
        },
      });

      if (response.data.success) {
        const tasksData = response.data.data;
        console.log(tasksData);

        // Extract column names dynamically
        const columns = Object.keys(tasksData);
        setTaskColumns(columns);

        // Transform API data to match component structure
        const transformedTasks = {};
        columns.forEach((column) => {
          transformedTasks[column] = tasksData[column].map((task) => ({
            ...task,
            priority: task.priority || "medium", // Add default priority if not present
            assignee: task.assignee || "Unassigned",
            status: column, // Set status to column name
            activities: task.activities || [
              {
                id: Date.now(),
                type: "created",
                user: task.assignee || "System",
                timestamp: task.createdDate,
                description: "Task created",
              },
            ],
            comments: task.comments || [],
          }));
        });

        setTasks(transformedTasks);
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
    getTaskData();
  }, []);

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
        isCurrentUser: post.employee_code === data?.employee_id,
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

  // Helper function to format column name for display
  const formatColumnName = (columnName) => {
    // Convert camelCase or snake_case to Title Case
    return columnName
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
      .trim();
  };

  // Helper function to get total task count
  const getTotalTaskCount = () => {
    return taskColumns.reduce((total, column) => {
      return total + (tasks[column]?.length || 0);
    }, 0);
  };

  // Get current user
  const currentUser = data?.employee_id;
  const messages = convertPostsToMessages(projectData.posts);
  const [newMessage, setNewMessage] = useState("");

  // Enhanced message handlers
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
      const response = await axios.delete(
        `${api_url}/project-posts/${messageId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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

  const scrollToBottom = () => {
    messagesEndRef?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update task status and position on drag and drop

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await axios.post(
        `${api_url}/task-status-change/${taskId}`,
        {
          status: newStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Task status updated successfully");
        return true;
      } else {
        toast.error("Failed to update task status");
        return false;
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      return false;
    }
  };

  const updateTaskPosition = async (taskId, positionData) => {
    try {
      const response = await axios.put(
        `${api_url}/project-task-position-update/${taskId}`,
        positionData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        return true;
      } else {
        toast.error("Failed to update task position");
        return false;
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      return false;
    }
  };

  // Drag and drop handlers

  const handleDragStart = (e, taskId, sourceColumn) => {
    e.dataTransfer.setData("taskId", taskId.toString());
    e.dataTransfer.setData("sourceColumn", sourceColumn);
    setDraggedTask({ id: taskId, sourceColumn });
    e.target.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e, columnName) => {
    e.preventDefault();
    setDragOverColumn(columnName);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e, targetColumn) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData("taskId"));
    const sourceColumn = e.dataTransfer.getData("sourceColumn");

    if (sourceColumn === targetColumn) return;

    const taskToMove = tasks[sourceColumn].find((task) => task.id === taskId);

    if (taskToMove) {
      // Update status via API
      const success = await updateTaskStatus(taskId, targetColumn);

      if (success) {
        const updatedTask = {
          ...taskToMove,
          status: targetColumn,
        };

        const moveActivity = {
          id: Date.now(),
          type: "moved",
          user: currentUser,
          timestamp: new Date().toLocaleString(),
          description: `Moved to ${formatColumnName(targetColumn)}`,
        };

        updatedTask.activities = [...updatedTask.activities, moveActivity];

        const updatedSourceTasks = tasks[sourceColumn].filter(
          (task) => task.id !== taskId
        );
        const updatedTargetTasks = [...tasks[targetColumn], updatedTask];

        setTasks({
          ...tasks,
          [sourceColumn]: updatedSourceTasks,
          [targetColumn]: updatedTargetTasks,
        });
      }
    }

    setDraggedTask(null);
    setDragOverColumn(null);
  };

  // Task popup handlers
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskPopup(true);
  };

  const handleCloseTaskPopup = () => {
    setShowTaskPopup(false);
    setSelectedTask(null);
    setTaskComment("");
    setAttachedFiles([]);
  };

  const handleAddTaskComment = async () => {
    if (taskComment.trim() === "") return;
    setHandleAddTaskCommentLoading(true);

    try {
      const response = await axios.post(
        `${api_url}/project-task-comment-add`,
        {
          task_id: selectedTask.id,
          comment_details: taskComment.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        getTaskData();
        getProjectData();
        // Create the new comment object for immediate UI update
        const newComment = {
          id: Date.now(), // Temporary ID
          user: currentUser,
          message: taskComment.trim(),
          timestamp: new Date().toLocaleString(),
        };

        // Update the selectedTask with the new comment
        setSelectedTask((prevTask) => ({
          ...prevTask,
          comments: [...prevTask.comments, newComment],
        }));

        // Update the tasks state to reflect the new comment
        const updatedTasks = { ...tasks };
        const taskColumn = selectedTask.status;
        const taskInColumn = updatedTasks[taskColumn].findIndex(
          (task) => task.id === selectedTask.id
        );

        if (taskInColumn !== -1) {
          updatedTasks[taskColumn][taskInColumn].comments = [
            ...updatedTasks[taskColumn][taskInColumn].comments,
            newComment,
          ];
          setTasks(updatedTasks);
        }

        setTaskComment("");
        setAttachedFiles([]);
        toast.success("Comment added successfully");
      } else {
        toast.error("Failed to add comment");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setHandleAddTaskCommentLoading(false);
    }
  };

  const handleRemoveAttachment = (attachmentId) => {
    setMessageAttachments(
      messageAttachments.filter((att) => att.id !== attachmentId)
    );
  };

  // Task menu handlers
  const handleTaskMenuClick = (task, event) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 5,
      right: window.innerWidth - rect.right,
    });
    setSelectedTaskForMenu(task);
    setShowTaskMenu(true);
  };

  const handleCloseTaskMenu = () => {
    setShowTaskMenu(false);
    setSelectedTaskForMenu(null);
  };

  const handleStatusChangeClick = () => {
    setShowStatusChangePopup(true);
    setShowTaskMenu(false);
  };

  const handleMoveTaskClick = () => {
    setShowMoveTaskPopup(true);
    setShowTaskMenu(false);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedTaskForMenu) return;

    // Update status via API
    const success = await updateTaskStatus(selectedTaskForMenu.id, newStatus);

    if (success) {
      const updatedTasks = { ...tasks };
      const currentColumn = selectedTaskForMenu.status;

      const taskIndex = updatedTasks[currentColumn].findIndex(
        (task) => task.id === selectedTaskForMenu.id
      );
      if (taskIndex !== -1) {
        const taskToMove = updatedTasks[currentColumn][taskIndex];
        updatedTasks[currentColumn].splice(taskIndex, 1);

        const updatedTask = {
          ...taskToMove,
          status: newStatus,
          activities: [
            ...taskToMove.activities,
            {
              id: Date.now(),
              type: "moved",
              user: currentUser,
              timestamp: new Date().toLocaleString(),
              description: `Status changed to ${formatColumnName(newStatus)}`,
            },
          ],
        };
        updatedTasks[newStatus].push(updatedTask);

        setTasks(updatedTasks);
      }

      setShowStatusChangePopup(false);
      setSelectedTaskForMenu(null);
      toast.success(`Task moved to ${formatColumnName(newStatus)}`);
    }
  };

  const handleMoveTask = (position) => {
    if (!selectedTaskForMenu) return;

    const updatedTasks = { ...tasks };
    const currentColumn = selectedTaskForMenu.status;
    const currentIndex = updatedTasks[currentColumn].findIndex(
      (task) => task.id === selectedTaskForMenu.id
    );

    if (currentIndex !== -1) {
      const taskToMove = updatedTasks[currentColumn][currentIndex];
      updatedTasks[currentColumn].splice(currentIndex, 1);

      let newIndex;
      if (position === "top") {
        newIndex = 0;
      } else if (position === "bottom") {
        newIndex = updatedTasks[currentColumn].length;
      } else {
        newIndex = Math.floor(updatedTasks[currentColumn].length / 2);
      }

      updatedTasks[currentColumn].splice(newIndex, 0, taskToMove);
      setTasks(updatedTasks);
    }

    setShowMoveTaskPopup(false);
    setSelectedTaskForMenu(null);
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const getNavIcon = (tabName) => {
    switch (tabName) {
      case "overview":
        return "📊";
      case "tasks":
        return "✅";
      case "messages":
        return "💬";
      default:
        return "🔗";
    }
  };

  // Render the messages tab content
  const renderMessagesTab = () => (
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
    </div>
  );

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewComponent
            projectData={projectData}
            taskColumns={taskColumns}
            tasks={tasks}
            formatColumnName={formatColumnName}
            getInitials={getInitials}
          />
        );

      case "tasks":
        return (
          <TasksComponent
            taskColumns={taskColumns}
            tasks={tasks}
            formatColumnName={formatColumnName}
            handleDragOver={handleDragOver}
            handleDragEnter={handleDragEnter}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
            handleTaskClick={handleTaskClick}
            handleTaskMenuClick={handleTaskMenuClick}
            dragOverColumn={dragOverColumn}
          />
        );

      case "messages":
        return renderMessagesTab();

      default:
        return null;
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="project-page-container">
      <div className="project-header">
        <h1 className="project-title">{projectData.project.title}</h1>
        <p className="project-description">{projectData.project.description}</p>
      </div>

      <nav className="project-nav">
        <ul className="nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <span className="nav-icon">{getNavIcon("overview")}</span>
              Overview
              <span className="nav-badge">Details</span>
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "tasks" ? "active" : ""}`}
              onClick={() => setActiveTab("tasks")}
            >
              <span className="nav-icon">{getNavIcon("tasks")}</span>
              Tasks
              <span className="nav-badge">{getTotalTaskCount()}</span>
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "messages" ? "active" : ""}`}
              onClick={() => setActiveTab("messages")}
            >
              <span className="nav-icon">{getNavIcon("messages")}</span>
              Messages
              <span className="nav-badge">{messages.length}</span>
            </button>
          </li>
        </ul>

        <div className="tab-content">{renderTabContent()}</div>
      </nav>

      {/* Task Details Popup */}
      {showTaskPopup && selectedTask && (
        <div className="task-popup-overlay" onClick={handleCloseTaskPopup}>
          <div className="task-popup" onClick={(e) => e.stopPropagation()}>
            <div className="task-popup-header">
              <h3>{selectedTask.title}</h3>
              <button className="close-btn" onClick={handleCloseTaskPopup}>
                ×
              </button>
            </div>

            <div className="task-popup-content">
              <div className="task-details-section">
                <div className="task-info">
                  <div className="info-row">
                    <span className="info-label">Description:</span>
                    <span className="info-value">
                      {selectedTask.description}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Assignee:</span>
                    <span className="info-value">{selectedTask.assignee}</span>
                  </div>
                  {selectedTask.priority && (
                    <div className="info-row">
                      <span className="info-label">Priority:</span>
                      <span
                        className={`priority-badge priority-${selectedTask.priority}`}
                      >
                        {selectedTask.priority}
                      </span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="info-label">Due Date:</span>
                    <span className="info-value">{selectedTask.dueDate}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Created:</span>
                    <span className="info-value">
                      {selectedTask.createdDate}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Status:</span>
                    <span className="info-value">
                      {formatColumnName(selectedTask.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="task-activities-section">
                <h4>Activity Timeline</h4>
                <div className="activities-list">
                  {selectedTask.activities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">
                        {activity.type === "created"
                          ? "➕"
                          : activity.type === "assigned"
                          ? "👤"
                          : activity.type === "moved"
                          ? "🔄"
                          : activity.type === "completed"
                          ? "✅"
                          : "📝"}
                      </div>
                      <div className="activity-content">
                        <div className="activity-description">
                          {activity.description}
                        </div>
                        <div className="activity-meta">
                          <span className="activity-user">{activity.user}</span>
                          <span className="activity-time">
                            {activity.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="task-comments-section">
                <h4>Comments ({selectedTask.comments.length})</h4>
                <div className="comments-list">
                  {selectedTask.comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <span className="comment-user">
                          {comment.user !== "" ? comment.user : "You"}
                        </span>
                        <span className="comment-time">
                          {comment.timestamp}
                        </span>
                      </div>
                      <div className="comment-content">{comment.comment}</div>
                    </div>
                  ))}
                </div>

                <div className="add-comment-section">
                  <div className="comment-input">
                    <textarea
                      placeholder="Add a comment..."
                      value={taskComment}
                      onChange={(e) => setTaskComment(e.target.value)}
                      rows="3"
                    />
                    <div className="comment-actions">
                      <button
                        className="add-comment-btn"
                        onClick={handleAddTaskComment}
                        disabled={
                          taskComment.trim() === "" ||
                          handleAddTaskCommentLoading
                        }
                      >
                        {handleAddTaskCommentLoading ? (
                          <>
                            <div className="loading-spinner"></div>
                            Adding...
                          </>
                        ) : (
                          "Add Comment"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All other popups remain the same */}
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

      {/* Task Menu Dropdown */}
      {showTaskMenu && selectedTaskForMenu && (
        <div className="task-menu-overlay" onClick={handleCloseTaskMenu}>
          <div
            className="task-menu-dropdown"
            onClick={(e) => e.stopPropagation()}
            style={{
              top: `${menuPosition.top}px`,
              right: `${menuPosition.right}px`,
            }}
          >
            <div className="task-menu-options">
              <button className="menu-option" onClick={handleStatusChangeClick}>
                🔄 Change Status
              </button>
              <button className="menu-option" onClick={handleMoveTaskClick}>
                📍 Move Work Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Popup */}
      {showStatusChangePopup && selectedTaskForMenu && (
        <div
          className="status-popup-overlay"
          onClick={() => setShowStatusChangePopup(false)}
        >
          <div className="status-popup" onClick={(e) => e.stopPropagation()}>
            <div className="status-popup-header">
              <h4>Change Status</h4>
              <button onClick={() => setShowStatusChangePopup(false)}>×</button>
            </div>
            <div className="status-options">
              {taskColumns
                .filter((column) => column !== selectedTaskForMenu.status)
                .map((column) => (
                  <button
                    key={column}
                    className="status-option"
                    onClick={() => handleStatusChange(column)}
                  >
                    🔄 Move to {formatColumnName(column)}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Move Task Popup */}
      {showMoveTaskPopup && selectedTaskForMenu && (
        <div
          className="move-popup-overlay"
          onClick={() => setShowMoveTaskPopup(false)}
        >
          <div className="move-popup" onClick={(e) => e.stopPropagation()}>
            <div className="move-popup-header">
              <h4>Move Work Item</h4>
              <button onClick={() => setShowMoveTaskPopup(false)}>×</button>
            </div>
            <div className="move-options">
              <button
                className="move-option"
                onClick={() => handleMoveTask("top")}
              >
                ⬆️ Move to Top
              </button>
              <button
                className="move-option"
                onClick={() => handleMoveTask("bottom")}
              >
                ⬇️ Move to Bottom
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProjectPage;

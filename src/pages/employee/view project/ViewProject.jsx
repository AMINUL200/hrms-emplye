import React, { useEffect, useRef, useCallback, useState } from "react";
import "./ViewProject.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarAlt,
    faUsers,
    faCodeBranch,
    faCommentAlt,
    faPaperclip,
    faFileImage,
    faFilePdf,
    faFileWord,
    faFileAlt,
    faTimes
} from "@fortawesome/free-solid-svg-icons";

const ViewProject = () => {
    const currentUser = "Aminul";
    const chatBoxRef = useRef(null);
    const fileInputRef = useRef(null);
    const [newMessage, setNewMessage] = useState("");
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [attachments, setAttachments] = useState([]);
    const [showFileTypes, setShowFileTypes] = useState(false);
    const resizeObserverRef = useRef(null);

    // Mock data - in production this would come from API
    const [projectData, setProjectData] = useState({
        title: "Solar Tracker System",
        description: "A system that automatically adjusts solar panels...",
        status: "Development Phase",
        progress: 65,
        deadline: "September 20, 2025",
        startDate: "May 15, 2025",
        members: [
            { name: "Aminul", role: "Team Lead", avatar: "A" },
            { name: "Rahul", role: "Backend Developer", avatar: "R" },
            { name: "Priya", role: "QA Engineer", avatar: "P" },
            { name: "Sneha", role: "UI/UX Designer", avatar: "S" },
        ],
        techStack: ["React", "Node.js", "Python", "Arduino", "MongoDB"],
        repository: "github.com/team-solar/solar-tracker",
        documents: [
            { name: "Project Proposal", lastUpdated: "May 10, 2025" },
            { name: "Technical Specifications", lastUpdated: "May 25, 2025" },
            { name: "Test Cases", lastUpdated: "June 15, 2025" },
        ],
        messages: [
            { sender: "Aminul", text: "Hey team, just checking in - the project is on track for our deadline!", time: "10:30 AM" },
            { sender: "Rahul", text: "I've updated the documentation with the new API endpoints.", time: "10:35 AM" },
            { sender: "Priya", text: "Testing will begin tomorrow morning. I've prepared all the test cases.", time: "10:40 AM" },
            { sender: "Sneha", text: "The final UI designs are complete. I'll implement them by tonight.", time: "10:45 AM" },
            { sender: "Aminul", text: "Great progress everyone! Remember to push your latest code to the GitHub repository.", time: "10:50 AM" },
            { sender: "Rahul", text: "Just pushed my changes. Everyone please pull before making new updates.", time: "10:55 AM" },
            { sender: "Priya", text: "I've pulled the latest updates. No merge conflicts so far.", time: "11:00 AM" },
            { sender: "Sneha", text: "Can we schedule a quick sync meeting after lunch?", time: "11:05 AM" },
            { sender: "Aminul", text: "Sure, let's meet at 2:00 PM in the conference room.", time: "11:07 AM" },
            { sender: "Rahul", text: "Works perfectly for my schedule.", time: "11:08 AM" },
            { sender: "Priya", text: "Same here! Looking forward to it 👍", time: "11:09 AM" },
        ],
    });

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
        if (isAtBottom) {
            scrollToBottom();
        }
    }, [projectData.messages, isAtBottom, scrollToBottom]);

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

    // Handle sending message with attachments
    const handleSendMessage = useCallback(() => {
        if (newMessage.trim() || attachments.length > 0) {
            const newMsg = {
                sender: currentUser,
                text: newMessage,
                time: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                attachments: attachments.map(att => ({
                    name: att.name,
                    type: att.type,
                    size: att.size,
                    // In a real app, you would upload the file and store the URL here
                    url: att.preview || null
                }))
            };

            setProjectData((prev) => ({
                ...prev,
                messages: [...prev.messages, newMsg],
            }));

            // Clear attachments and message
            attachments.forEach(att => {
                if (att.preview) URL.revokeObjectURL(att.preview);
            });
            scrollToBottom();
            setAttachments([]);
            setNewMessage("");
            setShowFileTypes(false);

        }
    }, [newMessage, attachments]);
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

    return (
        <div className="viewproject-container">
            {/* Left Side - Project Details */}
            <div className="project-details custom-scroll">
                <div className="project-header">
                    <h2>{projectData.title}</h2>
                    <div
                        className={`project-status ${projectData.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                    >
                        {projectData.status}
                    </div>
                </div>

                <p className="project-description">{projectData.description}</p>

                <div className="project-info-section">
                    <h3>
                        <FontAwesomeIcon icon={faCalendarAlt} /> Timeline
                    </h3>
                    <div className="info-grid">
                        <div>
                            <span className="info-label">Start Date</span>
                            <span className="info-value">{projectData.startDate}</span>
                        </div>
                        <div>
                            <span className="info-label">Deadline</span>
                            <span className="info-value">{projectData.deadline}</span>
                        </div>
                    </div>
                </div>

                <div className="project-info-section">
                    <h3>
                        <FontAwesomeIcon icon={faUsers} /> Team Members
                    </h3>
                    <div className="members-grid">
                        {projectData.members.map((member, index) => (
                            <div key={index} className="member-card">
                                <div className="member-avatar">{member.avatar}</div>
                                <div className="member-info">
                                    <span className="member-name">{member.name}</span>
                                    <span className="member-role">{member.role}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="project-info-section">
                    <h3>
                        <FontAwesomeIcon icon={faCodeBranch} /> Repository
                    </h3>
                    <a
                        href={`https://${projectData.repository}`}
                        className="repo-link"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {projectData.repository}
                    </a>
                </div>
            </div>

            {/* Right Side - Group Messages */}
            <div className="project-chat">
                <div className="chat-header">
                    <FontAwesomeIcon icon={faCommentAlt} aria-hidden="true" />
                    <h3>Team Discussion</h3>
                </div>
                <div
                    className="chat-box custom-scroll"
                    ref={chatBoxRef}
                    onScroll={handleScroll}
                    aria-live="polite"
                >
                    {projectData.messages.map((msg, index) => (
                        <div
                            key={`${msg.time}-${index}`}
                            className={`chat-message ${msg.sender === currentUser ? "mine" : ""}`}
                            aria-label={`Message from ${msg.sender}`}
                        >
                            {msg.sender !== currentUser && (
                                <div className="message-sender">{msg.sender}</div>
                            )}
                            <div className="message-content">
                                {msg.text && <div className="message-text">{msg.text}</div>}
                                {msg.attachments && msg.attachments.length > 0 && (
                                    <div className="message-attachments">
                                        {msg.attachments.map((att, i) => (
                                            <div key={i} className="attachment">
                                                <FontAwesomeIcon
                                                    icon={getFileIcon(att.type, att.name)}
                                                    className="attachment-icon"
                                                />
                                                <a
                                                    href={att.url || '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="attachment-name"
                                                >
                                                    {att.name}
                                                </a>
                                                {att.type === 'image' && att.url && (
                                                    <div className="attachment-preview">
                                                        <img src={att.url} alt={att.name} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="message-time" aria-hidden="true">
                                    {msg.time}
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
                                <label className="file-option"
                                
                                >
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

                    <div className="chat-input">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Write your message here..."
                            aria-label="Type your message"
                        />
                        <button
                            onClick={handleSendMessage}
                            aria-label="Send message"
                            disabled={!newMessage.trim() && attachments.length === 0}
                        >
                            <FontAwesomeIcon icon={faCommentAlt} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewProject;
import React, { useContext, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faThumbsUp,
    faComment,
    faShare,
    faEllipsisH,
    faHeart
} from '@fortawesome/free-solid-svg-icons';
import { faThumbsUp as farThumbsUp } from '@fortawesome/free-regular-svg-icons';
import './Post.css';
import { formatTimeAgo } from '../../utils/timeUtils';
import { AuthContext } from '../../context/AuthContex';
import { EmployeeContext } from '../../context/EmployeeContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import Reactions, { reactions } from '../reactions/Reactions';

const Post = ({ posts }) => {
    const api_url = import.meta.env.VITE_API_URL;
    const { token } = useContext(AuthContext);
    const { getPostData, handleAddComment: handleAddCommentContext } = useContext(EmployeeContext);
    // Dummy posts data
    const [newComment, setNewComment] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeCommentPost, setActiveCommentPost] = useState(null);

    const [activeReactions, setActiveReactions] = useState(null);
    const hoverTimeoutRef = useRef(null);


    const handleReactionHover = (postId) => {
        // Clear any pending timeouts
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }

        // Set timeout to show reactions after delay
        hoverTimeoutRef.current = setTimeout(() => {
            setActiveReactions(postId);
        }, 800);
    };

    const handleReactionLeave = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        // Add small delay before closing
        hoverTimeoutRef.current = setTimeout(() => {
            setActiveReactions(null);
        }, 600);
    };


    const handleLike = async (postId, reactionType = 'like') => {
        try {
            await axios.post(
                `${api_url}/posts-like/${postId}`,
                { name: reactionType },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            getPostData(token);

        } catch (error) {
            toast.error(error.message);
        }
    };

    const getReactionIcon = (post) => {
        const reaction = reactions.find(r => r.name === post.user_reaction);

        if (reaction) {
            return (
                <FontAwesomeIcon
                    icon={reaction.icon}
                    className="me-2"
                    style={{ color: reaction.color }}
                />
            );
        }

        return post.user_reaction !== null ? (
            <FontAwesomeIcon icon={faThumbsUp} className="me-2 fathumb" />
        ) : (
            <FontAwesomeIcon icon={farThumbsUp} className="me-2" />
        );
    };

    const getReactionLabel = (post) => {
        const reaction = reactions.find(r => r.name === post.user_reaction);
        return reaction ? reaction.label : 'Like';
    };


    const handleAddComment = (postId) => {
        if (!newComment.trim()) return;

        try {
            handleAddCommentContext(token, postId, newComment)
        } catch (error) {
            console.log(error.message);


        } finally {
            setNewComment('');
            setActiveCommentPost(null);
            getPostData(token);
        }

    };


    // Update timestamps every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());

        }, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const toggleCommentSection = (postId) => {
        setActiveCommentPost(activeCommentPost === postId ? null : postId);
    };
    return (
        <div className="container post-container" style={{ maxWidth: 'full', margin: '0 auto' }}>
            {posts.map(post => (
                <div key={post.id} className="card post-card">
                    {/* Post Header */}
                    <div className="card-header-post post-header">
                        <div className="d-flex align-items-center">
                            <img
                                src={post?.employee_image}
                                alt={post?.employee_name}
                                loading='lazy'
                                className="rounded-circle post-avatar "
                            />
                            <div className="ms-3">
                                <h5 className="mb-0 post-username">{post?.employee_name}</h5>
                                <small className="text-muted post-timestamp">
                                    {/* {formatTimeAgo(post.timestamp)} */}
                                    {post?.time_ago}
                                </small>
                            </div>
                        </div>
                        <button className="btn btn-sm text-muted post-options">
                            <FontAwesomeIcon icon={faEllipsisH} />
                        </button>
                    </div>

                    {/* Post Content */}
                    <div className="card-body">
                        <p className="card-text post-content">{post?.title}</p>

                        {/* Post Image */}
                        {post?.image_path && (
                            <img
                                src={post.image_path}
                                alt="Post content"
                                className="img-fluid rounded post-image"
                            />
                        )}
                    </div>

                    {/* Likes and Comments Count */}
                    <div className="card-comment text-muted post-stats">
                        <div className="d-flex justify-content-between">
                            <div className="d-flex align-items-center">
                                <span className="counter-box">
                                    {Object.entries(post?.reactions || {})
                                        .filter(([key, value]) => key !== 'total' && value > 0)
                                        .sort((a, b) => b[1] - a[1]) // Sort by count descending
                                        .map(([reactionType, count]) => {
                                            const reaction = reactions.find(r => r.name === reactionType);
                                            return reaction ? (
                                                <FontAwesomeIcon
                                                    key={reactionType}
                                                    icon={reaction.icon}
                                                    className="me-1"
                                                    style={{ color: reaction.color }}
                                                    title={`${count} ${reaction.label}`}
                                                />
                                            ) : null;
                                        })}
                                    <span className='count-val'>{post.reactions.total}</span>
                                </span>
                            </div>
                            <div>
                                <span>{post?.comments_count} comments</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="card-footer post-actions">
                        <div className="d-flex justify-content-between">
                            <div
                                className="reaction-wrapper"
                                onMouseLeave={handleReactionLeave}
                            >
                                <button
                                    onClick={() => handleLike(post.id)
                                    }
                                    onMouseEnter={() => handleReactionHover(post.id)}
                                    className={`btn btn-sm btn-action ${post.is_liked === 1 ? 'text-primary' : 'text-muted'}`}
                                >
                                    {getReactionIcon(post)}
                                    {getReactionLabel(post)}
                                </button>

                                {activeReactions === post.id && (
                                    <div
                                        className="reactions-popup-wrapper"
                                        onMouseEnter={() => setActiveReactions(post.id)}
                                        // onMouseLeave={() => setActiveReactions(null)}
                                    >
                                        <Reactions
                                            onSelect={(reaction) => {
                                                handleLike(post.id, reaction);
                                                setActiveReactions(null); 
                                            }}
                                            currentReaction={post.current_reaction}
                                            onClose={() => setActiveReactions(null)}
                                        />
                                    </div>
                               )} 
                            </div>
                            <button
                                onClick={() => toggleCommentSection(post.id)}
                                className="btn btn-sm btn-action text-muted"
                            >
                                <FontAwesomeIcon icon={faComment} className="me-2" />
                                Comment
                            </button>

                        </div>
                    </div>

                    {/* Comments Section */}
                    {activeCommentPost === post.id && (
                        <div className='card-footer post-comments-section'>
                            <div className=" post-comments">
                                {/* Existing Comments */}
                                {post?.comments?.length > 0 ? (
                                    post.comments.map(comment => (
                                        <div key={comment?.id} className="d-flex mb-3 ">
                                            <img
                                                src={comment?.commenter_image}
                                                alt={comment?.commenter_name}
                                                className="rounded-circle comment-avatar"
                                            />
                                            <div className="ms-3 comment-bubble ">
                                                <div className='bg-gray'>
                                                    <h6 className="mb-0 comment-username">{comment?.commenter_name}</h6>
                                                    <p className="mb-0 comment-text">{comment?.comment_text}</p>
                                                </div>
                                                <div className='d-flex gap-2 comment-action'>
                                                    <small>{comment?.time_ago}</small>
                                                    {/* <small>Like</small> */}
                                                    <small>Reply</small>
                                                </div>
                                                <div className='reply-btn'>
                                                    <small>View all  2 reply</small>
                                                </div>
                                            </div>

                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-3 text-muted">
                                        No comments yet
                                    </div>
                                )}


                            </div>
                            {/* Add Comment */}
                            <div className="d-flex mt-3">
                                <img
                                    src="https://randomuser.me/api/portraits/men/4.jpg"
                                    alt="You"
                                    className="rounded-circle comment-avatar"
                                />
                                <div className="d-flex flex-grow-1 ms-3">
                                    <input
                                        type="text"
                                        placeholder="Write a comment..."
                                        className="form-control comment-input"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                    />
                                    <button
                                        onClick={() => handleAddComment(post.id)}
                                        className="btn btn-primary ms-2 comment-post-btn"
                                    >
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>

                    )}
                </div>
            ))}
        </div>
    )
}

export default Post

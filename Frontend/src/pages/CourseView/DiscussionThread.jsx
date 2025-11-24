import React, { useState } from 'react';
import '../../styles/pages/DiscussionThread.css';
import { useAuth } from '../../context/AuthContext';
import { resolveImageUrl } from '../../services/api';

const DiscussionThread = ({ comments, onCreateComment, onReply, onDelete, onEdit }) => {
    const { user } = useAuth();
    const [replyContent, setReplyContent] = useState({});
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState("");

    const handleReplySubmit = (parentId) => {
        if (replyContent[parentId]) {
            onReply(parentId, replyContent[parentId]);
            setReplyContent({ ...replyContent, [parentId]: '' });
            setActiveReplyId(null);
        }
    };

    const startEditing = (comment) => {
        setEditingCommentId(comment.id);
        setEditContent(comment.content);
    };

    const submitEdit = (commentId) => {
        onEdit(commentId, editContent);
        setEditingCommentId(null);
        setEditContent("");
    };

    const renderComment = (comment, isReply = false) => (
        <div key={comment.id} className={`comment-item ${isReply ? 'reply-item' : ''}`}>
            <div className="comment-header">
                <div className="comment-user-info">
                    {/* Wyświetlanie awatara użytkownika w komentarzu */}
                    <img 
                        src={resolveImageUrl(comment.avatarUrl) || '/src/icon/usericon.png'} 
                        alt="Avatar" 
                        className="comment-avatar"
                        onError={(e) => {e.target.onerror = null; e.target.src = '/src/icon/usericon.png'}}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', marginRight: '10px', objectFit: 'cover' }}
                    />
                    <span className="comment-author">{comment.userName}</span>
                </div>
                <span className="comment-date">{new Date(comment.created).toLocaleDateString()}</span>
            </div>
            
            {editingCommentId === comment.id ? (
                <div className="comment-edit-form">
                    <textarea 
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="comment-input"
                    />
                    <div className="comment-actions">
                        <button onClick={() => submitEdit(comment.id)} className="save-btn">Zapisz</button>
                        <button onClick={() => setEditingCommentId(null)} className="cancel-btn">Anuluj</button>
                    </div>
                </div>
            ) : (
                <div className="comment-content">{comment.content}</div>
            )}

            <div className="comment-actions">
                <button onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)} className="reply-btn">
                    Odpowiedz
                </button>
                
                {user && user.username === comment.userName && (
                    <>
                        <button onClick={() => startEditing(comment)} className="edit-action-btn">Edytuj</button>
                        <button onClick={() => onDelete(comment.id)} className="delete-btn">Usuń</button>
                    </>
                )}
            </div>

            {activeReplyId === comment.id && (
                <div className="reply-form">
                    <textarea
                        placeholder="Napisz odpowiedź..."
                        value={replyContent[comment.id] || ''}
                        onChange={(e) => setReplyContent({ ...replyContent, [comment.id]: e.target.value })}
                        className="comment-input"
                    />
                    <button onClick={() => handleReplySubmit(comment.id)} className="submit-btn">
                        Wyślij
                    </button>
                </div>
            )}

            {comment.replies && comment.replies.length > 0 && (
                <div className="replies-list">
                    {comment.replies.map(reply => renderComment(reply, true))}
                </div>
            )}
        </div>
    );

    return (
        <div className="discussion-thread">
            {comments.map(comment => renderComment(comment))}
        </div>
    );
};

export default DiscussionThread;
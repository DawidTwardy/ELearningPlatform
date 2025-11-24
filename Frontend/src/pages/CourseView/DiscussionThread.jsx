import React, { useState, useEffect } from 'react';
import '../../styles/pages/DiscussionThread.css';
import { useAuth } from '../../context/AuthContext';
import { resolveImageUrl, fetchComments, createComment, updateComment, deleteComment } from '../../services/api';

const DiscussionThread = ({ courseId }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCommentContent, setNewCommentContent] = useState("");
    const [replyContent, setReplyContent] = useState({});
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState("");

    useEffect(() => {
        if (courseId) {
            loadComments();
        }
    }, [courseId]);

    const loadComments = async () => {
        try {
            setLoading(true);
            const data = await fetchComments(courseId);
            // Upewniamy się, że data to tablica
            setComments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Błąd pobierania komentarzy:", error);
            setComments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateComment = async () => {
        if (!newCommentContent.trim()) return;
        try {
            await createComment(courseId, newCommentContent);
            setNewCommentContent("");
            loadComments(); // Odśwież komentarze po dodaniu
        } catch (error) {
            console.error("Błąd dodawania komentarza:", error);
            alert("Nie udało się dodać komentarza.");
        }
    };

    const handleReplySubmit = async (parentId) => {
        const content = replyContent[parentId];
        if (!content || !content.trim()) return;
        
        try {
            await createComment(courseId, content, parentId);
            setReplyContent({ ...replyContent, [parentId]: '' });
            setActiveReplyId(null);
            loadComments();
        } catch (error) {
            console.error("Błąd dodawania odpowiedzi:", error);
            alert("Nie udało się dodać odpowiedzi.");
        }
    };

    const startEditing = (comment) => {
        setEditingCommentId(comment.id);
        setEditContent(comment.content);
    };

    const submitEdit = async (commentId) => {
        if (!editContent.trim()) return;
        try {
            await updateComment(commentId, editContent);
            setEditingCommentId(null);
            setEditContent("");
            loadComments();
        } catch (error) {
            console.error("Błąd edycji komentarza:", error);
            alert("Nie udało się edytować komentarza.");
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm("Czy na pewno chcesz usunąć ten komentarz?")) return;
        try {
            await deleteComment(commentId);
            loadComments();
        } catch (error) {
            console.error("Błąd usuwania komentarza:", error);
            alert("Nie udało się usunąć komentarza.");
        }
    };

    const renderComment = (comment, isReply = false) => (
        <div key={comment.id} className={`comment-item ${isReply ? 'reply-item' : ''}`}>
            <div className="comment-header">
                <div className="comment-user-info">
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
                
                {user && (user.username === comment.userName || user.role === 'Admin') && (
                    <>
                        <button onClick={() => startEditing(comment)} className="edit-action-btn">Edytuj</button>
                        <button onClick={() => handleDelete(comment.id)} className="delete-btn">Usuń</button>
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

    if (loading) return <div className="loading-comments">Ładowanie komentarzy...</div>;

    return (
        <div className="discussion-thread">
            <div className="new-comment-form">
                <textarea
                    placeholder="Dodaj komentarz do kursu..."
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                    className="comment-input"
                />
                <button onClick={handleCreateComment} className="submit-btn" disabled={!newCommentContent.trim()}>
                    Dodaj komentarz
                </button>
            </div>

            <div className="comments-list">
                {comments && comments.length > 0 ? (
                    comments.map(comment => renderComment(comment))
                ) : (
                    <p className="no-comments">Brak komentarzy. Bądź pierwszy!</p>
                )}
            </div>
        </div>
    );
};

export default DiscussionThread;
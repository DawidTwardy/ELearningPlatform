import React, { useState, useEffect } from 'react';
import '../../styles/pages/DiscussionThread.css';
import { useAuth } from '../../context/AuthContext';
import { resolveImageUrl, fetchComments, createComment, updateComment, deleteComment, createCommentReport } from '../../services/api';
import { AlertTriangle } from 'lucide-react';

const DiscussionThread = ({ courseId }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCommentContent, setNewCommentContent] = useState("");
    const [replyContent, setReplyContent] = useState({});
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState("");
    
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [commentToReportId, setCommentToReportId] = useState(null);
    const [reportReason, setReportReason] = useState('');

    useEffect(() => {
        if (courseId) {
            loadComments();
        }
    }, [courseId]);

    // Zmiana: Dodano parametr silent, aby nie migać "Loadingiem" przy odświeżaniu po edycji
    const loadComments = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const data = await fetchComments(courseId);
            setComments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Błąd pobierania komentarzy:", error);
            if (!silent) setComments([]);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleCreateComment = async () => {
        if (!newCommentContent.trim()) return;
        try {
            await createComment(courseId, newCommentContent);
            setNewCommentContent("");
            loadComments(true); // Ciche odświeżenie
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
            loadComments(true); // Ciche odświeżenie
        } catch (error) {
            console.error("Błąd dodawania odpowiedzi:", error);
            alert("Nie udało się dodać odpowiedzi.");
        }
    };

    const startEditing = (comment) => {
        setEditingCommentId(comment.id);
        setEditContent(comment.content);
        // Zamykamy ewentualne okno odpowiedzi, żeby nie przeszkadzało
        setActiveReplyId(null);
    };

    const submitEdit = async (commentId) => {
        if (!editContent.trim()) return;
        try {
            await updateComment(commentId, editContent);
            setEditingCommentId(null);
            setEditContent("");
            loadComments(true); // Ciche odświeżenie listy, żeby zaktualizować treść
        } catch (error) {
            console.error("Błąd edycji komentarza:", error);
            alert("Nie udało się edytować komentarza.");
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm("Czy na pewno chcesz usunąć ten komentarz?")) return;
        try {
            await deleteComment(commentId);
            loadComments(true); // Ciche odświeżenie
        } catch (error) {
            console.error("Błąd usuwania komentarza:", error);
            alert("Nie udało się usunąć komentarza.");
        }
    };

    const startReporting = (commentId) => {
        setCommentToReportId(commentId);
        setReportReason('');
        setIsReportModalOpen(true);
    };

    const handleReportSubmit = async () => {
        if (!reportReason.trim() || !commentToReportId) return;
        
        try {
            await createCommentReport(commentToReportId, reportReason);
            alert("Komentarz został zgłoszony do moderacji.");
            setIsReportModalOpen(false);
            setCommentToReportId(null);
            setReportReason('');
        } catch (error) {
            console.error(error);
            alert("Wystąpił błąd podczas wysyłania zgłoszenia: " + (error.message || "Błąd sieci"));
        }
    };

    const renderComment = (comment, isReply = false) => {
        const isEditing = editingCommentId === comment.id;

        return (
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
                
                {isEditing ? (
                    <div className="comment-edit-form">
                        <textarea 
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="comment-input"
                            autoFocus // Automatycznie ustawia kursor w polu edycji
                        />
                        <div className="comment-actions">
                            <button onClick={() => submitEdit(comment.id)} className="save-btn">Zapisz</button>
                            <button onClick={() => setEditingCommentId(null)} className="cancel-btn">Anuluj</button>
                        </div>
                    </div>
                ) : (
                    <div className="comment-content">{comment.content}</div>
                )}

                {/* Ukrywamy przyciski akcji, jeśli trwa edycja tego komentarza */}
                {!isEditing && (
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

                        {user && user.username !== comment.userName && (
                            <button 
                                onClick={() => startReporting(comment.id)} 
                                className="report-btn"
                                style={{ color: '#ffb74d' }}
                            >
                                <AlertTriangle size={14} style={{ marginRight: '5px' }} />
                                Zgłoś
                            </button>
                        )}
                    </div>
                )}

                {activeReplyId === comment.id && !isEditing && (
                    <div className="reply-form">
                        <textarea
                            placeholder="Napisz odpowiedź..."
                            value={replyContent[comment.id] || ''}
                            onChange={(e) => setReplyContent({ ...replyContent, [comment.id]: e.target.value })}
                            className="comment-input"
                            autoFocus
                        />
                        <div className="comment-actions">
                            <button onClick={() => handleReplySubmit(comment.id)} className="submit-btn">
                                Wyślij
                            </button>
                            <button onClick={() => setActiveReplyId(null)} className="cancel-btn">
                                Anuluj
                            </button>
                        </div>
                    </div>
                )}

                {comment.replies && comment.replies.length > 0 && (
                    <div className="replies-list">
                        {comment.replies.map(reply => renderComment(reply, true))}
                    </div>
                )}
            </div>
        );
    };

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

            {isReportModalOpen && (
                <div className="report-modal-overlay">
                    <div className="report-modal-container">
                        <h3 className="report-modal-title">Zgłoś komentarz</h3>
                        <p className="report-modal-description">
                            Opisz, dlaczego ten komentarz powinien zostać usunięty (np. obraźliwa treść).
                        </p>
                        <textarea
                            className="report-modal-textarea"
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            placeholder="Treść zgłoszenia..."
                        />
                        <div className="report-modal-actions">
                            <button
                                onClick={() => setIsReportModalOpen(false)}
                                className="report-modal-cancel-btn"
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={handleReportSubmit}
                                className="report-modal-submit-btn"
                            >
                                Wyślij
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiscussionThread;
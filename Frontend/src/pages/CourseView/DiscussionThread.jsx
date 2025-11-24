import React, { useState, useEffect, useContext } from 'react';
import '../../styles/pages/DiscussionThread.css';
import { fetchComments, createComment, updateComment, deleteComment } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const formatTimestamp = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Przed chwilą';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min temu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} godz. temu`;
    return `${Math.floor(diffInSeconds / 86400)} dni temu`;
};

const CommentReplyForm = ({ onCancel, onSubmit, isInstructorView, avatarUrl }) => {
  const [replyText, setReplyText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (replyText.trim() === "") return;
    onSubmit(replyText);
    setReplyText("");
  };

  const defaultAvatarSrc = isInstructorView ? "/src/AvatarInstructor/usericon_large.png" : "/src/icon/usericon.png";
  const avatarSrc = avatarUrl || defaultAvatarSrc;
  const placeholder = "Napisz odpowiedź...";

  return (
    <form onSubmit={handleSubmit} className="comment-form-wrapper reply-form">
      <img src={avatarSrc} alt="Twój awatar" className="comment-avatar reply-avatar" />
      <div className="reply-form-controls">
        <textarea
          className="comment-form-textarea"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder={placeholder}
          rows="2"
        />
        <div className="comment-form-actions">
          <button type="button" className="comment-form-cancel-btn" onClick={onCancel}>
            Anuluj
          </button>
          <button type="submit" className="comment-form-submit-btn">
            Odpowiedz
          </button>
        </div>
      </div>
    </form>
  );
};

const CommentItem = ({
  comment,
  currentUser,
  isInstructorView,
  isReplying,
  isEditing,
  editingText,
  onStartReply,
  onReplySubmit,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onEditingTextChange,
  replyingToCommentId,
  editingCommentId
}) => {
  
  const commentUserId = comment.userId || comment.UserId;
  const currentUserId = currentUser?.userId || currentUser?.id;
  
  const isOwner = currentUser && commentUserId && currentUserId && (String(commentUserId) === String(currentUserId));

  const handleUpdate = () => {
    onUpdate(comment.id, editingText);
  };
  
  const handleDelete = () => {
    if (window.confirm("Czy na pewno chcesz usunąć ten komentarz?")) {
      onDelete(comment.id);
    }
  };

  const handleReport = () => {
    alert("Komentarz został zgłoszony do administratora.");
  };

  return (
    <div className={`comment-item ${comment.isReply ? 'reply-item' : ''}`}>
      <img src={comment.avatar} alt={comment.author} className={`comment-avatar ${comment.isReply ? 'reply-avatar' : ''}`} />
      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-author">{comment.author}</span>
          <span className="comment-timestamp">{formatTimestamp(comment.createdAt)}</span>
        </div>

        {isEditing ? (
          <div className="comment-edit-wrapper">
            <textarea
              className="comment-edit-textarea"
              value={editingText}
              onChange={(e) => onEditingTextChange(e.target.value)}
              rows="3"
            />
            <div className="comment-edit-actions">
              <button className="comment-form-cancel-btn" onClick={onCancelEdit}>Anuluj</button>
              <button className="comment-form-submit-btn" onClick={handleUpdate}>Zapisz</button>
            </div>
          </div>
        ) : (
          <p className="comment-text">{comment.text}</p>
        )}

        {!isEditing && (
          <div className="comment-actions-wrapper">
             {currentUser && (
                <button className="comment-action-btn" onClick={() => onStartReply(comment.id)}>
                Odpowiedz
                </button>
             )}
            
            {isOwner ? (
              <>
                <span className="comment-action-divider">·</span>
                <button className="comment-action-btn" onClick={() => onStartEdit(comment)}>
                  Edytuj
                </button>
                <span className="comment-action-divider">·</span>
                <button className="comment-action-btn delete" onClick={handleDelete}>
                  Usuń
                </button>
              </>
            ) : (
              <>
                <span className="comment-action-divider">·</span>
                <button className="comment-action-btn report" onClick={handleReport}>
                  Zgłoś
                </button>
              </>
            )}
            
          </div>
        )}

        {isReplying && (
          <CommentReplyForm
            onCancel={() => onStartReply(null)}
            onSubmit={(replyText) => onReplySubmit(comment.id, replyText)}
            isInstructorView={isInstructorView}
            avatarUrl={currentUser?.avatar}
          />
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies-list">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={{ ...reply, isReply: true }}
                currentUser={currentUser}
                isInstructorView={isInstructorView}
                isReplying={replyingToCommentId === reply.id}
                isEditing={editingCommentId === reply.id}
                editingText={editingText}
                onStartReply={onStartReply}
                onReplySubmit={onReplySubmit}
                onStartEdit={onStartEdit}
                onCancelEdit={onCancelEdit}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onEditingTextChange={onEditingTextChange}
                replyingToCommentId={replyingToCommentId}
                editingCommentId={editingCommentId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const DiscussionThread = ({ isInstructorView, courseId }) => {
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  
  const authContext = useContext(AuthContext);
  
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  let contextUser = authContext?.user;
  
  if (!contextUser && authContext?.token) {
     const decoded = parseJwt(authContext.token);
     if (decoded) {
         contextUser = {
             id: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || decoded.nameid || decoded.sub,
             userName: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || decoded.unique_name || "Użytkownik",
             email: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || decoded.email,
             avatarUrl: decoded.avatarUrl
         };
     }
  }

  useEffect(() => {
    if (courseId) {
        loadComments();
    }
  }, [courseId]);

  const loadComments = async () => {
      try {
          setLoading(true);
          const data = await fetchComments(courseId);
          setComments(data);
      } catch (error) {
          console.error("Failed to load comments", error);
      } finally {
          setLoading(false);
      }
  };

  const defaultAvatarPath = isInstructorView ? "/src/AvatarInstructor/usericon_large.png" : "/src/icon/usericon.png";

  const currentUser = contextUser ? {
    name: contextUser.userName || contextUser.name || contextUser.email || "Użytkownik",
    avatar: contextUser.avatarUrl || defaultAvatarPath,
    userId: contextUser.id || contextUser.userId
  } : null;

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (newCommentText.trim() === "" || !currentUser) return;

    try {
        await createComment(courseId, newCommentText, null);
        setNewCommentText("");
        await loadComments();
    } catch (error) {
        console.error("Failed to add comment", error);
        alert("Nie udało się dodać komentarza.");
    }
  };

  const handleReplySubmit = async (parentId, replyText) => {
    try {
        await createComment(courseId, replyText, parentId);
        setReplyingToCommentId(null);
        await loadComments();
    } catch (error) {
        console.error("Failed to add reply", error);
        alert("Nie udało się dodać odpowiedzi.");
    }
  };
  
  const handleStartReply = (commentId) => {
    if (!currentUser) {
        alert("Musisz być zalogowany, aby odpowiedzieć.");
        return;
    }
    setReplyingToCommentId(commentId);
    setEditingCommentId(null);
  };
  
  const handleStartEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.text);
    setReplyingToCommentId(null);
  };
  
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };
  
  const handleDelete = async (idToDelete) => {
    try {
        await deleteComment(idToDelete);
        await loadComments();
    } catch (error) {
        console.error("Failed to delete comment", error);
        alert("Nie udało się usunąć komentarza.");
    }
  };
  
  const handleUpdate = async (idToUpdate, newText) => {
    try {
        await updateComment(idToUpdate, newText);
        handleCancelEdit();
        await loadComments();
    } catch (error) {
        console.error("Failed to update comment", error);
        alert("Nie udało się zaktualizować komentarza.");
    }
  };

  if (loading) return <div>Ładowanie komentarzy...</div>;

  return (
    <div className="discussion-container">
      <h3 className="discussion-title">Dyskusja ({comments.length})</h3>
      
      {currentUser ? (
        <form onSubmit={handleCommentSubmit} className="comment-form-wrapper">
            <img src={currentUser.avatar} alt="Twój awatar" className="comment-avatar" />
            <textarea
            className="comment-form-textarea"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Masz pytanie? Podziel się swoją opinią..."
            rows="3"
            />
            <button type="submit" className="comment-form-submit-btn">
            Dodaj
            </button>
        </form>
      ) : (
        <div className="login-prompt">
            Zaloguj się, aby dołączyć do dyskusji.
        </div>
      )}

      <div className="comment-list">
        {comments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUser={currentUser}
            isInstructorView={isInstructorView}
            isReplying={replyingToCommentId === comment.id}
            isEditing={editingCommentId === comment.id}
            editingText={editingCommentText}
            onStartReply={handleStartReply}
            onReplySubmit={handleReplySubmit}
            onStartEdit={handleStartEdit}
            onCancelEdit={handleCancelEdit}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onEditingTextChange={setEditingCommentText}
            replyingToCommentId={replyingToCommentId}
            editingCommentId={editingCommentId}
          />
        ))}
      </div>
    </div>
  );
};

export default DiscussionThread;
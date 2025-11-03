import React, { useState } from 'react';
import '../../styles/pages/DiscussionThread.css'; // ZMIENIONA ŚCIEŻKA

const MOCK_COMMENTS_DATA = [
  {
    id: 1,
    userId: "user_jan",
    author: "Jan Kowalski",
    avatar: "/src/icon/usericon.png",
    text: "Mam problem z zapytaniami JOIN. Czy ktoś mógłby wyjaśnić różnicę między INNER JOIN a LEFT JOIN w prostszy sposób?",
    timestamp: "2 dni temu",
    replies: [
      {
        id: 101,
        userId: "instructor_michal",
        author: "Michał Nowak (Instruktor)",
        avatar: "/src/AvatarInstructor/usericon_large.png",
        text: "Cześć Jan! Mówiąc najprościej: INNER JOIN bierze tylko te wiersze, które mają dopasowanie w obu tabelach. LEFT JOIN bierze WSZYSTKIE wiersze z lewej tabeli i dopasowuje do nich wiersze z prawej (jeśli istnieją).",
        timestamp: "1 dzień temu",
        replies: []
      }
    ]
  },
  {
    id: 2,
    userId: "user_anna",
    author: "Anna Zając",
    avatar: "/src/icon/usericon.png",
    text: "Dzięki za ten materiał PDF! Bardzo przydatne.",
    timestamp: "3 dni temu",
    replies: []
  },
  {
    id: 3,
    userId: "user_marek",
    author: "Marek B",
    avatar: "/src/icon/usericon.png",
    text: "To jest nieodpowiedni komentarz!",
    timestamp: "1 godzinę temu",
    replies: []
  }
];

const CommentReplyForm = ({ onCancel, onSubmit, isInstructorView }) => {
  const [replyText, setReplyText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (replyText.trim() === "") return;
    onSubmit(replyText);
    setReplyText("");
  };

  const avatarSrc = isInstructorView ? "/src/AvatarInstructor/usericon_large.png" : "/src/icon/usericon.png";
  const placeholder = isInstructorView ? "Napisz odpowiedź jako instruktor..." : "Napisz odpowiedź...";

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
  
  const isOwner = comment.userId === currentUser.userId;

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
          <span className="comment-timestamp">{comment.timestamp}</span>
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
            <button className="comment-action-btn" onClick={() => onStartReply(comment.id)}>
              Odpowiedz
            </button>
            
            {(isOwner || isInstructorView) ? (
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

const DiscussionThread = ({ isInstructorView }) => {
  const [comments, setComments] = useState(MOCK_COMMENTS_DATA);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const currentUser = {
    name: isInstructorView ? "Michał Nowak (Instruktor)" : "Anna Zając",
    avatar: isInstructorView ? "/src/AvatarInstructor/usericon_large.png" : "/src/icon/usericon.png",
    userId: isInstructorView ? "instructor_michal" : "user_anna"
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newCommentText.trim() === "") return;

    const newComment = {
      id: Date.now(),
      userId: currentUser.userId,
      author: currentUser.name,
      avatar: currentUser.avatar,
      text: newCommentText,
      timestamp: "Przed chwilą",
      replies: []
    };

    setComments([newComment, ...comments]);
    setNewCommentText("");
  };

  const addReplyRecursive = (nodes, parentId, newReply) => {
    return nodes.map(node => {
      if (node.id === parentId) {
        return { ...node, replies: [...node.replies, newReply] };
      }
      if (node.replies && node.replies.length > 0) {
        return { ...node, replies: addReplyRecursive(node.replies, parentId, newReply) };
      }
      return node;
    });
  };

  const handleReplySubmit = (commentId, replyText) => {
    const newReply = {
      id: Date.now(),
      userId: currentUser.userId,
      author: currentUser.name,
      avatar: currentUser.avatar,
      text: replyText,
      timestamp: "Przed chwilą",
      replies: []
    };
    setComments(prev => addReplyRecursive(prev, commentId, newReply));
    setReplyingToCommentId(null);
  };
  
  const handleStartReply = (commentId) => {
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
  
  const deleteRecursive = (nodes, idToDelete) => {
    return nodes.filter(node => node.id !== idToDelete).map(node => {
      if (node.replies && node.replies.length > 0) {
        return { ...node, replies: deleteRecursive(node.replies, idToDelete) };
      }
      return node;
    });
  };

  const handleDelete = (idToDelete) => {
    setComments(prev => deleteRecursive(prev, idToDelete));
  };
  
  const updateRecursive = (nodes, idToUpdate, newText) => {
    return nodes.map(node => {
      if (node.id === idToUpdate) {
        return { ...node, text: newText };
      }
      if (node.replies && node.replies.length > 0) {
        return { ...node, replies: updateRecursive(node.replies, idToUpdate, newText) };
      }
      return node;
    });
  };
  
  const handleUpdate = (idToUpdate, newText) => {
    setComments(prev => updateRecursive(prev, idToUpdate, newText));
    handleCancelEdit();
  };

  return (
    <div className="discussion-container">
      <h3 className="discussion-title">Dyskusja ({comments.length})</h3>
      
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
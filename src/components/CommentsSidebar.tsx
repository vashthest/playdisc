import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Play, Comment, Reply } from '../types';
import type { CommentsSidebarProps } from './types';
import './CommentsSidebar.css';

const CommentsSidebar = ({
  play,
  currentFrame,
  onFrameSelect,
  onPlayUpdate,
}: CommentsSidebarProps) => {
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const addComment = () => {
    if (!newComment.trim() || !onPlayUpdate) return;

    const comment: Comment = {
      id: uuidv4(),
      author: 'Anonymous', // TODO: Add auth
      frameIndex: currentFrame,
      position: { x: 0.5, y: 0.5 }, // TODO: Add click-to-place
      body: newComment.trim(),
      createdAt: new Date(),
    };

    const updatedPlay = {
      ...play,
      comments: [...play.comments, comment],
    };

    onPlayUpdate(updatedPlay);
    setNewComment('');
  };

  const addReply = (commentId: string) => {
    if (!replyText[commentId]?.trim() || !onPlayUpdate) return;

    const reply: Reply = {
      id: uuidv4(),
      author: 'Anonymous', // TODO: Add auth
      body: replyText[commentId].trim(),
      createdAt: new Date(),
    };

    const updatedPlay = {
      ...play,
      comments: play.comments.map((comment) =>
        comment.id === commentId
          ? { ...comment, replies: [...(comment.replies || []), reply] }
          : comment
      ),
    };

    onPlayUpdate(updatedPlay);
    setReplyText((prev) => ({ ...prev, [commentId]: '' }));
    setReplyingTo(null);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  return (
    <div className="comments-sidebar">
      <div className="comments-header">
        <h2 className="comments-title">Comments</h2>
      </div>

      <div className="comments-list">
        {play.comments
          .filter((comment) => comment.frameIndex === currentFrame)
          .map((comment) => (
            <div key={comment.id} className="comment-card">
              <div className="comment-header">
                <div className="comment-author">{comment.author}</div>
                <div className="comment-date">
                  {formatDate(comment.createdAt)}
                </div>
              </div>
              <div className="comment-body">{comment.body}</div>

              {/* Replies */}
              {comment.replies?.map((reply) => (
                <div key={reply.id} className="comment-reply">
                  <div className="reply-header">
                    <div className="reply-author">{reply.author}</div>
                    <div className="reply-date">
                      {formatDate(reply.createdAt)}
                    </div>
                  </div>
                  <div className="reply-body">{reply.body}</div>
                </div>
              ))}

              {/* Reply form */}
              {replyingTo === comment.id ? (
                <div className="reply-form">
                  <textarea
                    value={replyText[comment.id] || ''}
                    onChange={(e) =>
                      setReplyText((prev) => ({
                        ...prev,
                        [comment.id]: e.target.value,
                      }))
                    }
                    className="reply-textarea"
                    placeholder="Write a reply..."
                    rows={2}
                  />
                  <div className="reply-actions">
                    <button
                      className="reply-cancel-button"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText((prev) => ({ ...prev, [comment.id]: '' }));
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="reply-submit-button"
                      onClick={() => addReply(comment.id)}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="reply-button"
                  onClick={() => setReplyingTo(comment.id)}
                >
                  Reply
                </button>
              )}
            </div>
          ))}
      </div>

      {onPlayUpdate && (
        <div className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="comment-textarea"
            placeholder="Add a comment..."
            rows={3}
          />
          <div className="comment-submit">
            <button
              className="comment-submit-button"
              onClick={addComment}
            >
              Comment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsSidebar; 
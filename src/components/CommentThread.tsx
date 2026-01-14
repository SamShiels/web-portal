export type Comment = {
  id: string;
  author: string;
  message: string;
};

type CommentThreadProps = {
  isOpen: boolean;
  comments: Comment[];
  onToggle: () => void;
  commentId: string;
};

const CommentThread = ({ isOpen, comments, onToggle, commentId }: CommentThreadProps) => {
  return (
    <div className="paper-comments">
      {isOpen ? (
        <div className="paper-comment">
          <label className="paper-comment-label" htmlFor={commentId}>
            Leave a comment
          </label>
          <textarea
            id={commentId}
            rows={3}
            placeholder="Add a quick note for the authors..."
          />
          <div className="paper-comment-list">
            {comments.map((comment) => (
              <div key={comment.id} className="paper-comment-item">
                <p className="paper-comment-author">{comment.author}</p>
                <p className="paper-comment-message">{comment.message}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CommentThread;

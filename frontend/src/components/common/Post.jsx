import { useState } from "react";
import { Heart, MessageSquare } from "lucide-react";
import Comment from "./Comment";

export default function Post({ authorInitials, authorName, time, title, likes, comments }) {
  const [showComments, setShowComments] = useState(false);

  // --- NOUVEAU : état local du like ---
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setIsLiked(prev => !prev);
  };

  return (
    <div className="bg-grad-2 rounded-3xl p-6 shadow-md border border-blue/10">

      {/* Header auteur */}
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-grad-1 w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold">
          {authorInitials}
        </div>
        <div>
          <h3 className="font-semibold text-blue">{authorName}</h3>
          <span className="text-sm text-grayc">{time}</span>
        </div>
      </div>

      {/* Contenu */}
      <p className="mb-4 text-textc">{title}</p>

      {/* Actions */}
      <div className="flex gap-6 mb-4">

        {/* Likes */}
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={handleLike}
        >
          <Heart
            size={18}
            className={`transition ${
              isLiked ? "text-red fill-red" : "text-grayc"
            }`}
          />
          <span className="text-textc">{likeCount}</span>
        </div>

        {/* Comments */}
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => setShowComments(prev => !prev)}
        >
          <MessageSquare className="text-blue" size={18} />
          <span className="text-textc">{comments.length}</span>
        </div>
      </div>

      {/* Zone des commentaires */}
      {showComments && (
        <div className="space-y-4 animate-fadeIn">
          {comments.map((c, idx) => (
            <Comment key={idx} {...c} />
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import CommentReply from "./CommentReply";

export default function Comment({ userInitials, userName, time, text, replies = [] }) {
  const [showReplies, setShowReplies] = useState(true);
  const [showReplyInput, setShowReplyInput] = useState(false); // pour le champ de réponse

  return (
    <div className="flex items-start gap-3">
      <div className="bg-blue w-10 h-10 rounded-full flex text-white items-center justify-center font-semibold">
        {userInitials}
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <h4 className="font-semibold text-textc">{userName}</h4>
          <span className="text-xs text-grayc">{time}</span>
        </div>
        <p className="text-grayc text-sm">{text}</p>
       <div className="mt-2 flex gap-4 text-xs font-medium">
  <button
    className="text-blue hover:underline"
    onClick={() => setShowReplyInput(!showReplyInput)}
  >
    Answer
  </button>

  {replies.length > 0 && (
    <button
      className="text-grayc hover:underline"
      onClick={() => setShowReplies(!showReplies)}
    >
      {showReplies
        ? `hide ${replies.length} response(s)`
        : `show ${replies.length} response(s)`}
    </button>
  )}
</div>


        {/* Champ pour écrire une réponse */}
        {showReplyInput && (
          <div className="mt-2">
            <input
              type="text"
              placeholder="Write a reply..."
              className="w-full bg-surface border border-blue/20 rounded-xl px-3 py-2 text-textc text-sm"
            />
          </div>
        )}

        {/* Affichage conditionnel des replies */}
        {showReplies && replies.map((r, idx) => <CommentReply key={idx} {...r} />)}
      </div>
    </div>
  );
}

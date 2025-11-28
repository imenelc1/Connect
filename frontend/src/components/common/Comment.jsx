import CommentReply from "./CommentReply";

export default function Comment({ userInitials, userName, time, text, replies = [] }) {
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
        <div className="mt-2 flex gap-4 text-xs">
          <button className="text-blue font-medium">Answer</button>
          {replies.length > 0 && <button className="text-grayc">hide {replies.length} response(s)</button>}
        </div>
        {replies.map((r, idx) => <CommentReply key={idx} {...r} />)}
      </div>
    </div>
  );
}

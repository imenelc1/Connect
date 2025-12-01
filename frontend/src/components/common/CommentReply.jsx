export default function CommentReply({ userInitials, userName, time, text }) {
  return (
    <div className="flex items-start gap-3 ml-6 mt-2">
      <div className="bg-grad-1 w-9 h-9 rounded-full text-white flex items-center justify-center font-semibold">
        {userInitials}
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <h4 className="font-semibold text-textc text-sm">{userName}</h4>
          <span className="text-xs text-grayc">{time}</span>
        </div>
        <p className="text-grayc text-sm">{text}</p>
      </div>
    </div>
  );
}

import { Clock } from "lucide-react";
import "../../styles/index.css";

export default function NotificationItem({ title, date, day, time }) {
  return (
    <div className="bg-grad-3 shadow-sm rounded-xl p-4 border-l-8 border-muted mb-3">
      {/* Title */}
      <h3 className="font-semibold text-textc">{title}</h3>

      {/* Date + Day */}
      <p className="text-muted text-sm">{date} - {day}</p>

      {/* Time */}
      <div className="flex items-center gap-2 mt-1 text-gray text-sm">
        <Clock size={16} />
        <span>{time}</span>
      </div>
    </div>
  );
}

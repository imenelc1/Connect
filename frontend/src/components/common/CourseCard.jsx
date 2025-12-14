import { Eye, CheckCircle, XCircle, BookOpen } from "lucide-react";

export default function CourseCard({ course }) {
  return (
    <div
      className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm 
                 p-4 flex flex-col lg:flex-row gap-4 items-start"
    >
      {/* ICON */}
      <div className="bg-primary/10 rounded-xl p-3 flex items-center justify-center">
        <BookOpen className="text-primary" size={28} />
      </div>

      {/* TEXT CONTENT */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-textc leading-tight">
            {course.title}
          </h2>

          <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">
            {course.status}
          </span>

          <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
            {course.level}
          </span>
        </div>

        <p className="text-gray-600 text-sm leading-tight">{course.desc}</p>

        <p className="text-xs text-gray-500 flex items-center gap-1">
          Par <span className="font-medium">{course.instructor}</span> — {course.submitted}
        </p>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 mt-2">
          <button className="flex items-center gap-1 px-3 py-1 bg-black text-white rounded-full text-xs shadow hover:opacity-90">
            <Eye size={14} /> Examiner
          </button>

          <button className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary border border-primary rounded-full text-xs hover:bg-primary/20">
            <CheckCircle size={14} /> Approuver
          </button>

          <button className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-500 border border-red-400 rounded-full text-xs hover:bg-red-100">
            <XCircle size={14} /> Rejeter
          </button>
        </div>
      </div>
    </div>
  );
}

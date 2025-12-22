import { Eye, CheckCircle, XCircle, BookOpen } from "lucide-react";

export default function CourseCard({ course }) {
 
  return (
    <div
      className="w-full bg-grad-2  rounded-2xl shadow-sm hover:shadow-md transition
                 p-4 md:p-6 flex flex-col sm:flex-row gap-4 items-start"
    >
      {/* ICON */}
      <div className="bg-muted/10 rounded-xl p-3 md:p-4 flex items-center justify-center flex-shrink-0">
        <BookOpen className="text-muted" size={28} />
      </div>

      {/* TEXT CONTENT */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h2 className="text-base md:text-lg font-semibold text-muted leading-tight line-clamp-2">
            {course.title}
          </h2>

          <div className="flex flex-wrap gap-1">
            <span className="text-xs bg-muted/20 text-primary px-2 py-1 rounded-full whitespace-nowrap">
              {course.status}
            </span>

            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full whitespace-nowrap">
              {course.level}
            </span>
          </div>
        </div>

        <p className="text-gray-700 text-sm leading-tight line-clamp-2">
          {course.desc}
        </p>

        <p className="text-xs text-gray-300 mt-1 flex flex-wrap items-center gap-1">
          Par <span className="font-medium">{course.instructor}</span> — {course.submitted}
        </p>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap gap-2 mt-3">
          <button className="flex items-center gap-1 px-3 py-2 bg-gray-900 text-white rounded-full text-xs hover:opacity-90 transition whitespace-nowrap">
            <Eye size={14} /> Examiner
          </button>

          <button className="flex items-center gap-1 px-3 py-2 bg-muted/10 text-primary border border-primary rounded-full text-xs hover:bg-primary/20 transition whitespace-nowrap">
            <CheckCircle size={14} /> Approuver
          </button>

          <button className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-500 border border-red-400 rounded-full text-xs hover:bg-red-100 transition whitespace-nowrap">
            <XCircle size={14} /> Rejeter
          </button>
        </div>
      </div>
    </div>
  );
}
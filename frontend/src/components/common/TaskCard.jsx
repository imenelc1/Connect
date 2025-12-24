import { MessageSquare, Calendar, Clock,Send  } from "lucide-react";
import "../../styles/index.css";
import { useTranslation } from "react-i18next";

export default function TaskCard({ title, date, etat, code, feedback }) {
  const { t } = useTranslation("exerciceStudent");

  return (
    <div className="bg-white rounded-3xl shadow-md p-4 sm:p-6 border-2 border-gray w-full">
      {/* Title + Etat */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
        <div>
          <h3 className="text-lg font-bold">{title}</h3>
          <span className="flex items-center text-sm text-gray gap-1">
            <Calendar size={16} /> {date}
          </span>
        </div>
        <span className="flex items-center text-sm p-1 bg-purple rounded-full text-primary mt-2 sm:mt-0 gap-1">
          <Clock size={16} /> {etat}
        </span>
      </div>

      {/* Code Block */}
      <pre className="bg-primary/20 p-4 sm:p-6 rounded-2xl text-sm leading-relaxed overflow-x-auto">
        <code>
          <h4 className="text-primary font-semibold">
            {t("exerciceStudent.Submitted")}:
          </h4>
          <p className="font-semibold">{t("exerciceStudent.Solution")}:</p>
          {code}
        </code>
      </pre>

      {/* Feedback Zone */}
      <div className="mt-4">
        {feedback ? (
          <div>
            <strong className="flex font-semibold items-center gap-2">
              <MessageSquare size={16} className="text-purple"/> {t("exerciceStudent.Feedback")}:
            </strong>
            <div className="bg-primary/20 text-text p-4 rounded-xl text-sm flex flex-col mt-2">
              <span>{feedback}</span>
              <span
                className="mt-2 px-3 py-1 text-primary rounded-lg cursor-pointer hover:bg-primary/10 transition"
                role="button"
                tabIndex={0}
                onClick={() => console.log("Edit clicked")}
                onKeyDown={(e) =>
                  e.key === "Enter" && console.log("Edit clicked")
                }
              >
                {t("exerciceStudent.Edit")}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <label className="flex text-gray font-medium text-sm items-center gap-2">
               <MessageSquare size={16} className="text-purple"/>  {t("exerciceStudent.Feedback")}
            </label>
            <input
              type="text"
              placeholder="Enter feedback here..."
              className="bg-primary/20 w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple"
            />
            <button className="flex px-4 py-2 bg-purple text-white rounded-xl self-start items-center gap-2 mt-2">
              <Send  size={16} />{t("exerciceStudent.Send")}
            </button>
            
          </div>
        )}
      </div>
    </div>
  );
}

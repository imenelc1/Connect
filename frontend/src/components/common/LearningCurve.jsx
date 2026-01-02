import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import progressionService from "../../services/progressionService";
import { useTranslation } from "react-i18next";

export default function LearningCurveProf({ title }) {
  const [data, setData] = useState([]);
  const { t, i18n } = useTranslation("Dashboard");
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Appel à l'API prof pour récupérer l'historique global des étudiants
        const history = await progressionService.getGlobalProgressStudents();
        console.log(t("Dashboard.RawHistory"), history);

        // Formater les dates en jours courts et progression en nombres
        const formatted = history.map(item => {
          const [year, month, day] = item.date.split("-");
          const d = new Date(year, month - 1, day);
          return {
            day: d.toLocaleDateString("fr-FR", { weekday: "short" }),
            course_progress: Number(item.course_progress || 0),
            quiz_progress: Number(item.quiz_progress || 0)
          };
        });

        setData(formatted);
      } catch (err) {
        console.error(t("Dashboard.FetchHistoryError"), err);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="bg-card p-4 rounded-2xl shadow-md w-full h-full">
      <h2 className="text-lg font-semibold mb-4">{title || t("Dashboard.AverageS")}</h2>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="day" stroke="rgb(var(--color-gray))" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} stroke="rgb(var(--color-gray))" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgb(var(--color-card))",
                borderRadius: "10px",
                border: "1px solid rgb(var(--color-surface))"
              }}
              formatter={(value) => `${value}%`}
            />
            <Legend verticalAlign="top" height={36} />
            <Line
              type="monotone"
              dataKey="course_progress"
              stroke="rgb(var(--color-blue))"
              strokeWidth={3}
              dot={{ r: 3 }}
              name={t("Dashboard.Course")}
            />
            <Line
              type="monotone"
              dataKey="quiz_progress"
              stroke="rgb(var(--color-purple))"
              strokeWidth={3}
              dot={{ r: 3 }}
              name={t("Dashboard.Quiz")}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import progressionService from "../../services/progressionService";

export default function LearningCurveProf({ title = "Moyenne progression des étudiants" }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Appel à l'API prof pour récupérer l'historique global des étudiants
        const history = await progressionService.getGlobalProgressStudents();
        console.log("Historique brut prof :", history);

        // Formater les dates en jours courts et progression en nombre
        const formatted = history.map(item => {
          const [year, month, day] = item.date.split("-");
          const d = new Date(year, month - 1, day);
          return {
            day: d.toLocaleDateString("fr-FR", { weekday: "short" }),
            progression: Number(item.progression)
          };
        });

        setData(formatted);
      } catch (err) {
        console.error("Erreur récupération historique prof :", err);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="bg-card p-4 rounded-2xl shadow-md w-full h-full">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
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
            <Line
              type="monotone"
              dataKey="progression"
              stroke="rgb(var(--color-purple))"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
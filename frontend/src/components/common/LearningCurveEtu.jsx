import React, { useEffect, useState } from "react";
import "../../styles/index.css";
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

export default function LearningCurve({ title }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await progressionService.getGlobalProgressHistory();
        // s'assurer que la valeur est numérique
        const formatted = history.map(item => ({
          date: item.date,
          progression: Number(item.progression)
        }));
        console.log("Historique progression globale:", formatted);
        setData(formatted);
      } catch (err) {
        console.error(err);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="bg-card p-6 rounded-2xl shadow w-full h-full">
      <h2 className="text-xl font-bold mb-4">{title}</h2>

      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-surface))" />
          <XAxis dataKey="date" stroke="rgb(var(--color-gray))" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} stroke="rgb(var(--color-gray))" tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgb(var(--color-card))",
              borderRadius: "10px",
              border: "1px solid rgb(var(--color-surface))"
            }}
          />
          <Line
            type="monotone"
            dataKey="progression" // correspond à ton API
            stroke="rgb(var(--color-muted))"
            strokeWidth={3}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

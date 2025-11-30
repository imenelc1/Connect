import React from "react";
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

export default function LearningCurve({ title }) {
  const data = [
    { month: "Jan", A: 40, B: 30, C: 50 },
    { month: "Feb", A: 50, B: 45, C: 60 },
    { month: "Mar", A: 35, B: 55, C: 45 },
    { month: "Apr", A: 55, B: 50, C: 65 },
    { month: "May", A: 45, B: 40, C: 55 },
    { month: "Jun", A: 60, B: 55, C: 70 },
  ];

  return (
    <div className="bg-card p-6 rounded-2xl shadow w-full h-full">
      <h2 className="text-xl font-bold mb-4">{title}</h2>

      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-surface))" />

          <XAxis dataKey="month" stroke="rgb(var(--color-gray))" />
          <YAxis stroke="rgb(var(--color-gray))" />

          <Tooltip
            contentStyle={{
              backgroundColor: "rgb(var(--color-card))",
              borderRadius: "10px",
              border: "1px solid rgb(var(--color-surface))"
            }}
          />

          {/* Courbe bleue */}
          <Line
            type="monotone"
            dataKey="A"
            stroke="rgb(var(--color-muted)"
            strokeWidth={3}
            dot={false}
          />

          {/* Courbe violette */}
          <Line
            type="monotone"
            dataKey="B"
            stroke="rgb(var(--color-purple))"
            strokeWidth={3}
            dot={false}
          />

         
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

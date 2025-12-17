import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Dot
} from "recharts";

export default function LearningCurve({ title = "Avancement du cours" }) {
  const data = [
    { day: "Nov 23", value: 10 },
    { day: "Nov 24", value: 12 },
    { day: "Nov 25", value: 18 },
    { day: "Nov 26", value: 17 },
    { day: "Nov 27", value: 23 },
    { day: "Nov 28", value: 20 },
    { day: "Nov 29", value: 25 },
    { day: "Nov 30", value: 35 },
  ];

  const lastIndex = data.length - 1;

  return (
    <div className="bg-card p-4 rounded-2xl shadow-md w-full h-full">
      <h2 className="text-base text-primary font-semibold mb-1">{title}</h2>

      <div className="w-full h-48"> {/* 🔥 plus petit */}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(0,0,0,0.05)" vertical={false} />
            <XAxis dataKey="day" stroke="rgb(var(--color-gray))" tick={{ fontSize: 11 }} />
            <YAxis stroke="rgb(var(--color-gray))" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ borderRadius: "10px", padding: "4px 8px" }} />

            <Line
              type="monotone"
              dataKey="value"
              stroke="rgb(var(--color-muted))"
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, index } = props;

                if (index === lastIndex) {
                  return (
                    <>
                      <circle cx={cx} cy={cy} r={5} fill="rgb(var(--color-purple))" />
                      <circle cx={cx} cy={cy} r={3} fill="rgb(var(--color-primary))" />
                    </>
                  );
                }

                return (
                  <Dot
                    {...props}
                    r={3}
                    stroke="rgb(var(--color-primary))"
                    strokeWidth={1.5}
                    fill="white"
                  />
                );
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

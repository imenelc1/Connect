import {
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
import"../../styles/index.css";
import { useTranslation } from "react-i18next";

export default function GradeProgressionChart({ data, title }) {
   const { t } = useTranslation("ProgressStudent");
  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="font-semibold text-lg mb-4">{title|| t("grade")}</h2>

      <div className="w-full h-72">
<ResponsiveContainer width="100%" height="100%">
  <AreaChart data={data}>
    <defs>
      <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgb(var(--color-primary))" stopOpacity={0.4} />
        <stop offset="100%" stopColor="rgb(var(--color-primary))" stopOpacity={0.05} />
      </linearGradient>
    </defs>

    <CartesianGrid strokeDasharray="3 3" vertical={false} />
    <XAxis dataKey="day" /> {}
    <YAxis domain={[0, 100]} /> {/* score en % */}
    <Tooltip />

    <Area
      type="monotone"
      dataKey="grade"
      stroke="rgb(var(--color-primary))"
      fill="url(#lineGradient)"
      strokeWidth={3}
    />
  </AreaChart>
</ResponsiveContainer>

      </div>
    </div>
  );
}
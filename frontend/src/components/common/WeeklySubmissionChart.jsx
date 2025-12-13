import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";

export default function WeeklySubmissionChart() {
      const { t } = useTranslation("ProgressStudent");
  const data = [
    { week: "Week 1", submissions: 100 },
    { week: "Week 2", submissions: 95 },
    { week: "Week 3", submissions: 60 },
    { week: "Week 4", submissions: 100 },
    { week: "Week 5", submissions: 78 },
    { week: "Week 6", submissions: 80 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow p-6 w-full">
      <h2 className="font-semibold text-lg mb-4">{t("ProgressStudent.Weekly")}</h2>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="submissions" fill="rgb(var(--color-pink)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

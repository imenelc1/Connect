import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";
import axios from "axios";

export default function WeeklySubmissionChart({ studentId = null }) {
  const { t } = useTranslation("ProgressStudent");
  const [weeklyData, setWeeklyData] = useState([]);
  const token = localStorage.getItem("token");
  const BACKEND_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        const url = studentId
          ? `${BACKEND_URL}/api/dashboard/student/weekly-submission-chart/${studentId}/`
          : `${BACKEND_URL}/api/dashboard/student/student-weekly-submission-chart/`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setWeeklyData(res.data || []);
        console.log(t("weeklyDataLog"), res.data); // 🔹 Vérification
      } catch (err) {
        console.error(t("errors.weeklySubmissionsError"), err);
        setWeeklyData([]);
      }
    };

    fetchWeeklyData();
  }, [studentId, token]);

  return (
    <div className="bg-white rounded-2xl shadow p-6 w-full">
      <h2 className="font-semibold text-lg mb-4">
        {t("ProgressStudent.Weekly")}
      </h2>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weeklyData}>
            <YAxis />
            <XAxis dataKey="label" /> {/* label = "Week 1", "Week 2", ... */}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const day = payload[0].payload;
                  const date = new Date(day.date);

                  return (
                    <div className="bg-white p-2 rounded shadow border">
                      <p className="font-semibold">
                        {date.toLocaleDateString()}
                      </p>
                      <p>
                        {t("ProgressStudent.submissionsLabel")}{" "}
                        {day.submissions}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="submissions"
              fill="rgb(var(--color-purple))"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

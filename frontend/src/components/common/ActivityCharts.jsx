import React, { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";
import { useTranslation } from "react-i18next";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Tooltip,
  Legend
);


const ActivityCharts = () => {
  const { t, i18n } = useTranslation("DashboardAdmin");
  const [stats, setStats] = useState({
    registrations: [],
    logins: [],
    coursesFollowed: [],
    labels: []
  });

  useEffect(() => {
    fetchActivityStats();
  }, []);

  const fetchActivityStats = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/activity/stats");
      const data = await res.json();

      setStats({
        labels: data.labels, // ex: ["Jan","Feb","Mar"]
        registrations: data.registrations,
        logins: data.logins,
        coursesFollowed: data.coursesFollowed
      });
    } catch (err) {
     console.error(`${t('errors.loadingStats')} `, err);

    }
  };

  const barData = {
    labels: stats.labels,
    datasets: [
      {
       label: t("charts.registrations"),
        data: stats.registrations,
        backgroundColor: "rgba(54, 162, 235, 0.6)"
      },
      {
        label: t("charts.logins"),
        data: stats.logins,
        backgroundColor: "rgba(255, 206, 86, 0.6)"
      }
    ]
  };

  const coursesLineData = {
    labels: stats.labels,
    datasets: [
      {
        label: t("charts.coursesFollowed"),
        data: stats.coursesFollowed,
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.3
      }
    ]
  };
  

  return (
    <div className="charts-container">

    <h2>📊 {t("charts.activityTitle")}</h2>

      <div className="chart-card">
        <h3>{t("charts.registrationsAndLogins")}</h3>
        <Bar data={barData} />
      </div>

      <div className="chart-card">
        <h3>📚 {t("charts.coursesFollowed")}</h3>
        <Line data={coursesLineData} />
      </div>
    </div>
  );
};

export default ActivityCharts;

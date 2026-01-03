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
import { FaChartBar, FaBook } from "react-icons/fa";

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
  const { t } = useTranslation("DashboardAdmin");

  const [stats, setStats] = useState({
    labels: [],
    registrations: [],
    logins: [],
    coursesFollowed: []
  });

  const fetchActivityStats = async () => {
    try {
      const token = localStorage.getItem("admin_token");

      const res = await fetch("http://localhost:8000/api/dashboard/activity/stats/", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) throw new Error(`Erreur API : ${res.status}`);

      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Erreur chargement stats :", error);
    }
  };

  useEffect(() => {
    fetchActivityStats();
  }, []);

  const barData = {
    labels: stats.labels,
    datasets: [
      {
        label: t("charts.registrations"),
        data: stats.registrations,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderRadius: 6
      },
      {
        label: t("charts.logins"),
        data: stats.logins,
        backgroundColor: "rgba(255, 159, 64, 0.6)",
        borderRadius: 6
      }
    ]
  };

  const lineData = {
    labels: stats.labels,
    datasets: [
      {
        label: t("charts.coursesFollowed"),
        data: stats.coursesFollowed,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };
  

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top"
      },
      tooltip: {
        mode: "index",
        intersect: false
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="charts-container space-y-6 p-4">
      {/* Titre général */}
      <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
        <FaChartBar className="text-blue-600" /> {t("charts.activityTitle")}
      </h2>

      {/* Bar Chart: registrations & logins */}
      <div className="chart-card p-4 bg-white shadow-md rounded-lg">
        <h3 className="flex items-center gap-2 text-lg font-medium mb-2">
          <FaChartBar className="text-teal-600" /> {t("charts.registrationsAndLogins")}
        </h3>
        <div className="h-64">
          <Bar data={barData} options={chartOptions} />
        </div>
      </div>

      {/* Line Chart: courses followed */}
      <div className="chart-card p-4 bg-white shadow-md rounded-lg">
        <h3 className="flex items-center gap-2 text-lg font-medium mb-2">
          <FaBook className="text-blue-500" /> {t("charts.coursesFollowed")}
        </h3>
        <div className="h-64">
          <Line data={lineData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default ActivityCharts;

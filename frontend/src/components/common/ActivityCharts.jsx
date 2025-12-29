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
      console.error("Erreur chargement stats :", err);
    }
  };

  const barData = {
    labels: stats.labels,
    datasets: [
      {
        label: "Inscriptions",
        data: stats.registrations,
        backgroundColor: "rgba(54, 162, 235, 0.6)"
      },
      {
        label: "Connexions",
        data: stats.logins,
        backgroundColor: "rgba(255, 206, 86, 0.6)"
      }
    ]
  };

  const coursesLineData = {
    labels: stats.labels,
    datasets: [
      {
        label: "Cours suivis",
        data: stats.coursesFollowed,
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.3
      }
    ]
  };

  return (
    <div className="charts-container">

      <h2>📊 Activité de la plateforme</h2>

      <div className="chart-card">
        <h3>📥 Inscriptions & 🔐 Connexions</h3>
        <Bar data={barData} />
      </div>

      <div className="chart-card">
        <h3>📚 Cours suivis</h3>
        <Line data={coursesLineData} />
      </div>
    </div>
  );
};

export default ActivityCharts;

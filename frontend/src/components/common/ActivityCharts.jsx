"use client"

import React, { useEffect, useState } from "react"
import { Bar, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js"
import { useTranslation } from "react-i18next"
import { FaChartBar } from "react-icons/fa"
const getCssRgb = (varName, alpha = 1) => {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim()

  // "79 157 222" -> "79,157,222"
  const rgb = raw.replace(/\s+/g, ",")

  return `rgba(${rgb}, ${alpha})`
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Tooltip,
  Legend
)

const ActivityCharts = () => {
  const { t } = useTranslation("DashboardAdmin")

  const [stats, setStats] = useState({
    labels: [],
    registrations: [],
    logins: [],
    coursesFollowed: [],
  })

  const [colors, setColors] = useState(null)


  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("admin_token")
        const res = await fetch(
          "http://localhost:8000/api/dashboard/activity/stats/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
        if (!res.ok) throw new Error("Erreur API")
        setStats(await res.json())
      } catch (e) {
        console.error(e)
      }
    }

    fetchStats()
  }, [])
  useEffect(() => {
    setColors({
      primary: getCssRgb("--color-primary", 0.75),
      secondary: getCssRgb("--color-secondary", 0.75),
      line: getCssRgb("--color-blue", 1),
      fill: getCssRgb("--color-blue", 0.18),
      grid: getCssRgb("--color-gray-light", 0.4),
      text: getCssRgb("--color-text", 0.8),
    })
  }, [])

  /* ================= COLORS (AFTER MOUNT) ================= */


  /* ⛔ Ne pas render tant que les couleurs ne sont pas prêtes */
  if (!colors) return null

  /* ================= DATA ================= */
  const barData = {
    labels: stats.labels,
    datasets: [
      {
        label: t("charts.registrations"),
        data: stats.registrations,
        backgroundColor: colors.primary,
        hoverBackgroundColor: colors.primary,
        borderColor: "transparent",
        borderRadius: 8,
      },
      {
        label: t("charts.logins"),
        data: stats.logins,
        backgroundColor: colors.secondary,
        hoverBackgroundColor: colors.secondary,
        borderColor: "transparent",
        borderRadius: 8,
      },
    ],
  }


  const lineData = {
  labels: stats.labels,
  datasets: [
    {
      label: t("charts.coursesFollowed"),
      data: stats.coursesFollowed,
      borderColor: colors.line,
      backgroundColor: colors.fill,
      fill: true,
      tension: 0.35,
      pointRadius: 4,
    },
  ],
}


  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: colors.text,
        },
      },
    },
    scales: {
      x: {
        grid: { color: colors.grid },
        ticks: { color: colors.text },
      },
      y: {
        beginAtZero: true,
        grid: { color: colors.grid },
        ticks: { color: colors.text },
      },
    },
  }

  return (
    <div className="p-6 space-y-8">
      <h2 className="flex items-center gap-3 text-2xl font-semibold text-textc">
        <FaChartBar className="text-primary" />
        {t("charts.activityTitle")}
      </h2>

      <div className="bg-card rounded-xl shadow-card p-5">
        <h3 className="text-lg font-medium mb-4 text-textc">
          {t("charts.registrationsAndLogins")}
        </h3>
        <div className="h-64">
          <Bar data={barData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-card p-5">
        <h3 className="text-lg font-medium mb-4 text-textc">
          {t("charts.coursesFollowed")}
        </h3>
        <div className="h-64">
          <Line data={lineData} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}

export default ActivityCharts
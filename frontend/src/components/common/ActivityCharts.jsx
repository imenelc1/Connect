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
import dayjs from "dayjs"
import "dayjs/locale/fr"
import "dayjs/locale/en"

// Fonction utilitaire pour récupérer les couleurs CSS
const getCssRgb = (varName, alpha = 1) => {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim()

  const rgb = raw.replace(/\s+/g, ",")
  return `rgba(${rgb}, ${alpha})`
}

// Register Chart.js components
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
  const { t, i18n } = useTranslation("DashboardAdmin")

  // Appliquer la langue pour dayjs
  useEffect(() => {
    dayjs.locale(i18n.language)
  }, [i18n.language])

  const [stats, setStats] = useState({
    labels: [],
    registrations: [],
    logins: [],
    coursesFollowed: [],
  })

  const [colors, setColors] = useState(null)

  // Fetch des stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("admin_token")
        const res = await fetch(
          "${process.env.REACT_APP_API_URL}/api/dashboard/activity/stats/",
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

  // Couleurs après mount
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

  // ⛔ Ne pas render tant que les couleurs ne sont pas prêtes
  if (!colors) return null

  // Traduire les labels (mois/jours) pour les charts
  const translatedLabels = stats.labels.map(dateStr =>
    dayjs(dateStr).format("DD MMM") // "12 janv." en fr, "12 Jan" en en
  )

  // Data pour Bar chart
  const barData = {
    labels: translatedLabels,
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

  // Data pour Line chart
  const lineData = {
    labels: translatedLabels,
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

  // Options chart
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

      {/* Bar Chart: Registrations & Logins */}
      <div className="bg-card rounded-xl shadow-card p-5">
        <h3 className="text-lg font-medium mb-4 text-textc">
          {t("charts.registrationsAndLogins")}
        </h3>
        <div className="h-64">
          <Bar data={barData} options={chartOptions} />
        </div>
      </div>

      {/* Line Chart: Courses Followed */}
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

import React from "react";
import Navbar from "../components/common/NavBar";
import UserCircle from "../components/common/UserCircle";
import TaskCard from "../components/common/TaskCard";
import "../styles/index.css";
import { useTranslation } from "react-i18next";
import NotificationBell from "../components/common/NotificationBell";
import { useNotifications } from "../context/NotificationContext";
export default function StudentExercice() {
  const { t } = useTranslation("exerciceStudent");

  return (
    <div className="flex flex-col lg:flex-row bg-primary/10 min-h-screen ">

      {/* Sidebar */}
      <Navbar />

      {/* Main content */}
      <div className="flex-1 p-4 sm:p-8 lg:ml-56">

        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-md p-6 sm:p-8 mb-6 sm:mb-8 w-full max-w-full lg:max-w-5xl mx-auto">
           <div className="bg-bg w-7 h-7 rounded-full flex items-center justify-center">
              <NotificationBell />
            </div>
          <div className="flex flex-col sm:flex-row items-center sm:gap-6">
            <UserCircle />

            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-semibold">Meriem Hamouche</h2>
              <p className="text-gray text-sm sm:text-base">merry@school.fr</p>
              <p className="text-gray   text-xs sm:text-sm">Joined on Sept 15, 2024</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-16 mt-4 sm:mt-6 text-center justify-center">
            <div>
              <p className="text-xl sm:text-2xl font-bold text-primary">16.5</p>
              <p className="text-gray">{t("exerciceStudent.AvarageG")}</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-purple">95%</p>
              <p className="text-gray">{t("exerciceStudent.Submission")}</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-pink">17/20</p>
              <p className="text-gray">{t("exerciceStudent.Completed")}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-full sm:max-w-5xl py-2 px-4 sm:px-6 bg-gradient-to-r from-primary/30 to-purple rounded-full mb-6 sm:mb-8">
          <span  role="button" className="px-12 py-1 bg-card text-gray/10 font-semibold rounded-full mb-2 sm:mb-0">
            {t("exerciceStudent.exercice")}
          </span>
          <span  role="button" className="px-12 py-1 text-gray/10 rounded-full">
            {t("exerciceStudent.Progression")}
          </span>
        </div>

        {/* Tasks Section */}
        <div className="flex flex-col gap-6 sm:gap-8 max-w-full sm:max-w-5xl mx-auto">
          <TaskCard
            title="Binary Search Implementation"
            date="oct 27,2024,2:30 PM"
            etat={t("exerciceStudent.Pending")}
            code={`function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    let mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}`}
          />
          <TaskCard
            title="Bubble Sort Algorithm"
            date="oct 27,2024,2:30 PM"
            etat={t("exerciceStudent.Reviewect")}
            code={`function BBDEsort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let tmp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = tmp;
      }
    }
  }
  return arr;
}`}
            feedback="Excellent implementation! Your code is clean and well-commented."
          />
        </div>
      </div>
    </div>
  );
}

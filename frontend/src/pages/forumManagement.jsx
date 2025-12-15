import React from "react";
import Navbar from "../components/common/NavBar";
import Button from "../components/common/Button";
import { Search, MessageSquare, TrendingUp, User, Plus } from "lucide-react";
import "../styles/index.css";
import { useTranslation } from "react-i18next";

export default function ForumManagement() {
  const { t } = useTranslation("ForumManagement");
  const forums = [
    { title: t("ForumManagement.GeneralD"), description: t("ForumManagement.Talk"), threads: 456, posts: 2341, members: 1234 },
    { title: t("ForumManagement.Homework"), description: t("ForumManagement.gethelp"), threads: 789, posts: 3056, members: 987 },
    { title: t("ForumManagement.ProjetShowcas"), description: t("ForumManagement.share"), threads: 32, posts: 874, members: 654 },
    { title: t("ForumManagementAlgorithmD"), description: t("ForumManagement.deepDive"), threads: 345, posts: 1987, members: 789 },
    { title: t("ForumManagement.career"), description: t("ForumManagement.Careerp"), threads: 76, posts: 765, members: 532 },
    { title: t("ForumManagement.Bug"), description: t("ForumManagement.Report"), threads: 87, posts: 234, members: 124 },
  ];

  return (
   <div className="flex bg-surface min-h-screen">
  {/* NAVBAR toujours visible */}
  <div className="flex-shrink-0 w-16 sm:w-64 transition-all duration-300">
    <Navbar />
  </div>

  {/* MAIN CONTENT */}
  <main className="flex-1 p-4 sm:p-6 md:p-10" style={{ marginLeft: '0' }}>
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">{t("ForumManagement.forumM")}</h1>
        <p className="text-gray">{t("ForumManagement.Managediscussion")}</p>
      </div>
      <Button variant="heroPrimary" className="!w-full sm:!w-auto bg-primary rounded-full px-6 py-3 flex items-center gap-2">
        <Plus size={18} />
        {t("ForumManagement.createF")}
      </Button>
    </div>

    {/* Search bar */}
    <div className="relative mb-6 sm:mb-10 w-full max-w-md">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray w-5 h-5" />
      <input
        className="w-full pl-12 pr-4 py-3 rounded-full border border-gray shadow-sm focus:outline-none"
        placeholder={t("ForumManagement.searchF")}
      />
    </div>

    {/* FORUM LIST */}
    <div className="flex flex-col gap-5">
      {forums.map((forum, i) => (
        <div
          key={i}
          className="bg-card border border-gray-200 rounded-xl p-6 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4"
        >
          {/* LEFT PART = icon + text */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-6 h-6 text-primary" strokeWidth={2} />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
              <div>
                <h3 className="text-xl font-semibold">{forum.title}</h3>
                <p className="text-gray-500 mt-1">{forum.description}</p>

                {/* Stats */}
                <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center gap-4 mt-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    <span>{forum.threads} {t("ForumManagement.threads")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span>{forum.posts} {t("ForumManagement.posts")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{forum.members} {t("ForumManagement.memebers")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT BUTTON */}
          <div className="w-full sm:w-auto mt-4 sm:mt-0 flex justify-end">
            <Button variant="manage">{t("ForumManagement.ButtonManage")}</Button>
          </div>
        </div>
      ))}
    </div>
  </main>
</div>

  );
}

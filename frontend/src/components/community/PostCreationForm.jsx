import { useState } from "react";
import { FiSend } from "react-icons/fi";
import { Loader } from "lucide-react";
import Input from "../common/Input";
import Button from "../common/Button";
import { validateForumData, getConfirmationMessage, getCibleFromForumType } from "../../utils/formUtils";
import { useTranslation } from "react-i18next";

export default function PostCreationForm({
  forumTypeToCreate,
  setForumTypeToCreate,
  role,
  token,
  initials,
  userData,
  setPosts,
  setError,
  triggerNotificationEvent,
  API_URL
}) {
 const { t, i18n } = useTranslation("community");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");

  const handleCreatePost = async () => {
    const validationErrors = validateForumData(newPostTitle, newPostContent);
    if (validationErrors.length > 0) {
      setError(validationErrors.join(". "));
      return;
    }

    const allowedForumTypes = {
      enseignant: ["teacher-teacher", "teacher-student"],
      etudiant: ["student-student", "student-teacher"]
    };

    if (!allowedForumTypes[role]?.includes(forumTypeToCreate)) {
      setError(t("errors.cannotCreateForum"));
      return;
    }

    if (!token) {
      setError(t("errors.mustBeLogged"));
      return;
    }

    const confirmationMessage = getConfirmationMessage(role, forumTypeToCreate);
    if (confirmationMessage) {
      const confirm = window.confirm(confirmationMessage);
      if (!confirm) return;
    }

    setIsCreatingPost(true);
    setError("");

    try {
      const cible = getCibleFromForumType(forumTypeToCreate);

      const forumData = {
        titre_forum: newPostTitle,
        contenu_forum: newPostContent,
        type: forumTypeToCreate,
        cible: cible
      };

      const response = await fetch(`${API_URL}/forums/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(forumData)
      });

      if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.detail || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
      }

      const createdForum = await response.json();

      if (!createdForum.id_forum) {
        throw new Error(t("errors.invalidServerResponse"));
      }

      const newForum = {
        id: createdForum.id_forum,
        authorInitials: initials,
        authorName: `${userData.nom || ""} ${userData.prenom || ""}`.trim(),
        time: createdForum.date_creation || new Date().toISOString(),
        title: createdForum.titre_forum,
        likes: 0,
        userHasLiked: false,
        type: createdForum.type || forumTypeToCreate,
        isMine: true,
        commentsCount: 0,
        contenu_forum: createdForum.contenu_forum,
        forumData: createdForum,
        creatorRole: role
      };

      setPosts(prev => [newForum, ...prev]);
      setNewPostTitle("");
      setNewPostContent("");

      triggerNotificationEvent();
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error("Error creating forum:", error);
      setError(t("errors.createFailed", { error: error.message }));
    } finally {
      setIsCreatingPost(false);
    }
  };

  return (
    <div className="bg-grad-2 w-full shadow-lg rounded-3xl p-4 mb-8 border border-blue/20 dark:border-blue-800/30">
      {/* Forum Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("postCreation.forumTitle")}
        </label>
        <Input
          placeholder={t("postCreation.forumTitlePlaceholder")}
          value={newPostTitle}
          onChange={(e) => { setNewPostTitle(e.target.value); setError(""); }}
          className="bg-[rgb(var(--color-input-bg))] text-[rgb(var(--color-input-text))] placeholder-[rgb(var(--color-input-placeholder))] border border-[rgb(var(--color-input-border))] rounded-xl px-5 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
          disabled={isCreatingPost}
          maxLength={200}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
          {t("postCreation.forumTitleCount", { count: newPostTitle.length })}
        </p>
      </div>

      {/* Initial Message */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("postCreation.initialMessage")}
        </label>
        <textarea
          placeholder={t("postCreation.initialMessagePlaceholder")}
          value={newPostContent}
          onChange={(e) => { setNewPostContent(e.target.value); setError(""); }}
          className="w-full bg-[rgb(var(--color-input-bg))] text-[rgb(var(--color-input-text))] placeholder-[rgb(var(--color-input-placeholder))] border border-[rgb(var(--color-input-border))] rounded-xl px-5 py-3 h-40 resize-none focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] transition"
          disabled={isCreatingPost}
          maxLength={2000}
        />
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("postCreation.initialMessageInfo")}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("postCreation.initialMessageCount", { count: newPostContent.length })}
          </p>
        </div>
      </div>

      {/* Publish For */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("postCreation.publishFor")}
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          {role === "enseignant" && (
            <>
              <Button
                type="button"
                variant={forumTypeToCreate === "teacher-teacher" ? "tabActive" : "tab"}
                onClick={() => setForumTypeToCreate("teacher-teacher")}
                className="w-full justify-start"
              >
                <div className="text-left">
                  <div className="font-medium">{t("postCreation.toTeachers")}</div>
                  <div className="text-xs mt-1 opacity-80">{t("postCreation.visibleByTeachers")}</div>
                </div>
              </Button>

              <Button
                type="button"
                variant={forumTypeToCreate === "teacher-student" ? "tabActive" : "tab"}
                onClick={() => setForumTypeToCreate("teacher-student")}
                className="w-full justify-start"
              >
                <div className="text-left">
                  <div className="font-medium">{t("postCreation.toStudents")}</div>
                  <div className="text-xs mt-1 opacity-80">{t("postCreation.visibleOnlyStudents")}</div>
                </div>
              </Button>
            </>
          )}

          {role === "etudiant" && (
            <>
              <Button
                type="button"
                variant={forumTypeToCreate === "student-student" ? "tabActive" : "tab"}
                onClick={() => setForumTypeToCreate("student-student")}
                className="w-full justify-start"
              >
                <div className="text-left">
                  <div className="font-medium">{t("postCreation.toStudents")}</div>
                  <div className="text-xs mt-1 opacity-80">{t("postCreation.visibleByStudents")}</div>
                </div>
              </Button>

              <Button
                type="button"
                variant={forumTypeToCreate === "student-teacher" ? "tabActive" : "tab"}
                onClick={() => setForumTypeToCreate("student-teacher")}
                className="w-full justify-start"
              >
                <div className="text-left">
                  <div className="font-medium">{t("postCreation.toTeachers")}</div>
                  <div className="text-xs mt-1 opacity-80">{t("postCreation.visibleOnlyTeachers")}</div>
                </div>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-grayc dark:text-gray-400">
          {t("postCreation.postedBy")} <span className="font-semibold">{initials}</span>
          <span className="ml-2 px-2 py-1 text-xs bg-blue/10 dark:bg-blue-900/30 text-blue dark:text-blue-300 rounded">
            {role === "enseignant" ? t("postCreation.roleTeacher") : t("postCreation.roleStudent")}
          </span>
        </div>

        <Button
          variant="send"
          text={isCreatingPost ? t("postCreation.posting") : t("postCreation.send")}
          className="!w-auto px-6 py-2"
          onClick={handleCreatePost}
          disabled={isCreatingPost || !newPostTitle.trim() || !newPostContent.trim()}
          icon={isCreatingPost ? <Loader className="animate-spin ml-2" size={16} /> : <FiSend className="ml-2" />}
        />
      </div>
    </div>
  );
}

import { useState, useRef, useCallback } from "react";
import {
  Loader,
  Heart,
  Trash2,
  Send,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";
import Input from "../common/Input";

export default function ForumItem({
  post,
  messages,
  expandedForums,
  newMessages,
  postingMessage,
  loadingMessages,
  setNewMessages,
  handleLike,
  handlePostMessage,
  toggleForumMessages,
  handleDeleteForum,
  getForumTypeLabel,
  getForumTypeClasses,
  formatTimeAgo,
  token,
  role,
  userId,
  setMessages,
  setPosts,
  API_URL,
  triggerNotificationEvent,
  t,
}) {
  const [deletingForumId, setDeletingForumId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const messagesEndRef = useRef(null);

  return (
    <div className="bg-grad-2 dark:bg-gray-800 rounded-3xl p-6 shadow-md border border-blue/10 dark:border-gray-700">
      {/* ===== Header ===== */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-grad-1 w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold">
            {post.authorInitials}
          </div>
          <div>
            <h3 className="font-semibold text-blue dark:text-blue-400">
              {post.authorName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-grayc dark:text-gray-400">
                {formatTimeAgo(post.time)}
              </p>
              <span
                className={`px-2 py-1 text-xs rounded border ${getForumTypeClasses(
                  post.type
                )}`}
              >
                {getForumTypeLabel(post.type)}
              </span>
            </div>
          </div>
        </div>

        {post.isMine && (
          <span className="px-3 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">
            {t("actions.yourForum")}
          </span>
        )}
      </div>

      {/* ===== Content ===== */}
      <h2 className="mb-4 text-textc dark:text-white font-bold text-lg">
        {post.title}
      </h2>

      <p className="text-textc dark:text-gray-300 whitespace-pre-wrap">
        {post.contenu_forum}
      </p>

      {/* ===== Footer (FIX MOBILE ICI) ===== */}
      <div
        className="
          flex flex-col gap-3
          sm:flex-row sm:items-center sm:justify-between
          pt-4 border-t border-gray-200 dark:border-gray-700
        "
      >
        {/* Left actions */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => handleLike(post.id)}
            className="flex items-center gap-2 text-grayc dark:text-gray-400 hover:text-red-500 transition-colors"
            disabled={!token}
          >
            <Heart size={20} />
            <span>
              {post.likes} {post.likes === 1 ? "like" : "likes"}
            </span>
          </button>

          <button
            onClick={() => toggleForumMessages(post.id)}
            className="flex items-center gap-2 text-grayc dark:text-gray-400 hover:text-blue transition-colors"
          >
            <MessageSquare size={18} />
            <span>
              {expandedForums[post.id] ? "Masquer" : "Voir"} les messages
            </span>
            {expandedForums[post.id] ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
        </div>

        {/* Delete button */}
        {post.isMine && (
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setShowDeleteConfirm(post.id)}
              disabled={deletingForumId === post.id}
              className="
                w-full sm:w-auto
                flex items-center justify-center gap-2
                px-3 sm:px-4 py-2
                rounded-xl
                bg-red-50 dark:bg-red-900/20
                border border-red-500
                text-red-700 dark:text-red-300
                hover:bg-red-100 dark:hover:bg-red-900/30
                hover:border-red-600 hover:text-red-800
                transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-sm text-sm
              "
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Supprimer le forum</span>
              <span className="sm:hidden">Supprimer</span>
            </button>

            {showDeleteConfirm === post.id && (
              <div className="absolute top-full right-0 mt-2 w-full sm:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-red-200 dark:border-red-800 p-4 z-10">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  Supprimer ce forum ? Cette action est irréversible.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleDeleteForum(post.id)}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== Input message ===== */}
      <div className="mt-4 flex items-center gap-2">
        <Input
          placeholder="Écrivez votre réponse..."
          value={newMessages[post.id] || ""}
          onChange={(e) =>
            setNewMessages((prev) => ({ ...prev, [post.id]: e.target.value }))
          }
          className="flex-1 rounded-full"
          disabled={!token}
        />
        <button
          onClick={() => handlePostMessage(post.id)}
          className="bg-blue text-white p-2 rounded-full hover:bg-blue-dark transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

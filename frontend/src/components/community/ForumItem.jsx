import { useState, useRef, useCallback } from "react";
import { Loader, Heart, Trash2, Send, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
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
  t
}) {
  const [deletingForumId, setDeletingForumId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [likingMessageId, setLikingMessageId] = useState(null);
  const [newComments, setNewComments] = useState({});
  const [postingComment, setPostingComment] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [showDeleteCommentConfirm, setShowDeleteCommentConfirm] = useState(null);
  
  const messagesEndRef = useRef(null);

  const toggleMessageComments = useCallback((messageId) => {
    setExpandedComments(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  }, []);

  const handlePostComment = useCallback(async (messageId, forumId) => {
    const commentContent = newComments[messageId]?.trim();
    
    if (!commentContent || !token) {
      return;
    }
    
    setPostingComment(prev => ({ ...prev, [messageId]: true }));
    
    try {
      const response = await fetch(`${API_URL}/messages/${messageId}/comments/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contenu_comm: commentContent
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }
      
      const newComment = await response.json();
      
      setMessages(prev => {
        const forumMessages = prev[forumId] || [];
        const updatedMessages = forumMessages.map(msg => {
          if (msg.id_message === messageId) {
            const updatedCommentaires = [...(msg.commentaires || []), newComment];
            return {
              ...msg,
              commentaires: updatedCommentaires,
              nombre_commentaires: updatedCommentaires.length
            };
          }
          return msg;
        });
        return { ...prev, [forumId]: updatedMessages };
      });
      
      setNewComments(prev => ({ ...prev, [messageId]: "" }));
      setExpandedComments(prev => ({ ...prev, [messageId]: true }));
      
      triggerNotificationEvent();
      
    } catch (error) {
      console.error("Erreur lors de l'envoi du commentaire:", error);
    } finally {
      setPostingComment(prev => ({ ...prev, [messageId]: false }));
    }
  }, [token, API_URL, newComments, triggerNotificationEvent, setMessages]);

  const handleDeleteComment = useCallback(async (commentId, messageId, forumId) => {
    if (!token) {
      return;
    }
    
    setDeletingCommentId(commentId);
    
    try {
      const response = await fetch(`${API_URL}/comments/${commentId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setMessages(prev => {
          const forumMessages = prev[forumId] || [];
          const updatedMessages = forumMessages.map(msg => {
            if (msg.id_message === messageId && msg.commentaires) {
              const updatedCommentaires = msg.commentaires.filter(c => c.id_commentaire !== commentId);
              return {
                ...msg,
                commentaires: updatedCommentaires,
                nombre_commentaires: updatedCommentaires.length
              };
            }
            return msg;
          });
          return { ...prev, [forumId]: updatedMessages };
        });
        
        setPosts(prev => prev.map(post => {
          if (post.id === forumId) {
            return {
              ...post,
              commentsCount: Math.max(0, (post.commentsCount || 0) - 1)
            };
          }
          return post;
        }));
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(t("errors.delError"), errorData.error || `Erreur ${response.status}`);
      }
    } catch (error) {
      console.error(t("errors.delNetworkerror"), error);
    } finally {
      setDeletingCommentId(null);
      setShowDeleteCommentConfirm(null);
    }
  }, [token, API_URL, setMessages, setPosts]);

  const handleLikeMessage = useCallback(async (messageId, forumId) => {
    if (!token) {
      return;
    }

    setLikingMessageId(messageId);

    const currentMessages = messages[forumId] || [];
    const message = currentMessages.find(m => m.id_message === messageId);
    
    if (!message) {
      setLikingMessageId(null);
      return;
    }

    const newLikedState = !message.user_has_liked;
    const newLikesCount = newLikedState ? (message.nombre_likes || 0) + 1 : Math.max(0, (message.nombre_likes || 0) - 1);
    
    setMessages(prev => {
      const forumMessages = prev[forumId] || [];
      const updatedMessages = forumMessages.map(msg => 
        msg.id_message === messageId
          ? { 
              ...msg, 
              nombre_likes: newLikesCount, 
              user_has_liked: newLikedState 
            }
          : msg
      );
      return { ...prev, [forumId]: updatedMessages };
    });

    try {
      const response = await fetch(`${API_URL}/messages/${messageId}/like/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        setMessages(prev => {
          const forumMessages = prev[forumId] || [];
          const updatedMessages = forumMessages.map(msg => 
            msg.id_message === messageId
              ? { 
                  ...msg, 
                  nombre_likes: message.nombre_likes || 0, 
                  user_has_liked: message.user_has_liked || false 
                }
              : msg
          );
          return { ...prev, [forumId]: updatedMessages };
        });
        
        console.error(t("errors.likeError"), errorData.error || `Erreur ${response.status}`);
      } else {
        const data = await response.json();
        setMessages(prev => {
          const forumMessages = prev[forumId] || [];
          const updatedMessages = forumMessages.map(msg => 
            msg.id_message === messageId
              ? { 
                  ...msg, 
                  nombre_likes: data.likes_count || newLikesCount, 
                  user_has_liked: data.user_has_liked || newLikedState 
                }
              : msg
          );
          return { ...prev, [forumId]: updatedMessages };
        });

        triggerNotificationEvent();
      }
    } catch (error) {
      setMessages(prev => {
        const forumMessages = prev[forumId] || [];
        const updatedMessages = forumMessages.map(msg => 
          msg.id_message === messageId
            ? { 
                ...msg, 
                nombre_likes: message.nombre_likes || 0, 
                user_has_liked: message.user_has_liked || false 
              }
            : msg
        );
        return { ...prev, [forumId]: updatedMessages };
      });
      
      console.error(t("errors.likeNetworkerrors"), error);
    } finally {
      setLikingMessageId(null);
    }
  }, [token, API_URL, messages, triggerNotificationEvent, setMessages]);

  return (
    <div className="bg-grad-2 dark:bg-gray-800 rounded-3xl p-6 shadow-md border border-blue/10 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-grad-1 w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold">
            {post.authorInitials}
          </div>
          <div>
            <h3 className="font-semibold text-blue dark:text-blue-400">{post.authorName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-grayc dark:text-gray-400">
                {formatTimeAgo(post.time)}
              </p>
              <span className={`px-2 py-1 text-xs rounded border ${getForumTypeClasses(post.type)}`}>
                {getForumTypeLabel(post.type)}
              </span>
              {post.type === "student-teacher" && (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded border border-yellow-200 dark:border-yellow-800">
                  {/* Question d'étudiant */}
                  {t("actions.studentQuestion")}
                </span>
              )}
            </div>
          </div>
        </div>
        {post.isMine && (
          <span className="px-3 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">
            {/* Votre forum */}
              {t("actions.yourForum")}
          </span>
        )}
      </div>
      
      <h2 className="mb-4 text-textc dark:text-white font-bold text-lg">
        {post.title}
      </h2>
      
      <p className="text-textc dark:text-gray-300 whitespace-pre-wrap">
        {post.contenu_forum}
      </p>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => handleLike(post.id)}
            className="flex items-center space-x-2 text-grayc dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50"
            disabled={!token}
            aria-label={post.userHasLiked ? "Retirer le like" : "Ajouter un like"}
            aria-pressed={post.userHasLiked}
          >
            <Heart 
              size={20} 
              fill={post.userHasLiked ? "#ef4444" : "none"} 
              color={post.userHasLiked ? "#ef4444" : "#6b7280"} 
            />
            <span className={post.userHasLiked ? "text-red-500 dark:text-red-400 font-semibold" : ""}>
              {post.likes} {post.likes === 1 ? 'like' : 'likes'}
            </span>
          </button>
          
          <button 
            onClick={() => toggleForumMessages(post.id)}
            className="flex items-center space-x-2 text-grayc dark:text-gray-400 hover:text-blue dark:hover:text-blue-400 transition-colors"
            aria-expanded={expandedForums[post.id]}
          >
            <MessageSquare size={18} />
            <span>
              {expandedForums[post.id] ? 'Masquer' : 'Voir'} les messages
              {!expandedForums[post.id] && messages[post.id]?.length > 0 && 
                ` (${messages[post.id].length} réponse${messages[post.id].length !== 1 ? 's' : ''})`
              }
            </span>
            {expandedForums[post.id] ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
        </div>
        
        {post.isMine && (
          <div className="relative">
            <button 
              onClick={() => setShowDeleteConfirm(post.id)}
              disabled={deletingForumId === post.id}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-500 text-red-700 dark:text-red-300 
                       hover:bg-red-100 dark:hover:bg-red-900/30 hover:border-red-600 hover:text-red-800 dark:hover:text-red-200 transition-colors 
                       disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              aria-label="Supprimer le forum"
            >
              {deletingForumId === post.id ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Supprimer le forum
                </>
              )}
            </button>
            
            {showDeleteConfirm === post.id && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-red-200 dark:border-red-800 p-4 z-10">
                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                    <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">Supprimer ce forum ?</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Cette action est irréversible. Tous les messages et commentaires seront supprimés.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleDeleteForum(post.id)}
                    disabled={deletingForumId === post.id}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deletingForumId === post.id ? 'Suppression...' : 'Supprimer'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Écrivez votre réponse... (max 2000 caractères)"
            value={newMessages[post.id] || ""}
            onChange={(e) => setNewMessages(prev => ({ ...prev, [post.id]: e.target.value }))}
            onKeyPress={(e) => e.key === 'Enter' && !postingMessage[post.id] && handlePostMessage(post.id)}
            className="flex-1 bg-white dark:bg-gray-700 text-textc dark:text-white border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2"
            disabled={postingMessage[post.id] || !token}
            maxLength={2000}
          />
          <button
            onClick={() => handlePostMessage(post.id)}
            disabled={postingMessage[post.id] || !newMessages[post.id]?.trim() || !token}
            className="bg-blue dark:bg-blue-600 text-white p-2 rounded-full hover:bg-blue-dark dark:hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Envoyer la réponse"
          >
            {postingMessage[post.id] ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
        {newMessages[post.id] && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
            {newMessages[post.id].length}/2000 caractères
          </p>
        )}
      </div>
      
      {expandedForums[post.id] && messages[post.id]?.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
            {messages[post.id].length} réponse{messages[post.id].length !== 1 ? 's' : ''}
          </h4>

          <div className="mb-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin">
            {loadingMessages[post.id] ? (
              <div className="flex justify-center py-8">
                <Loader className="animate-spin" size={20} />
              </div>
            ) : (
              <div className="space-y-4">
                {messages[post.id]?.map(message => (
                  <div key={message.id_message} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue/20 dark:bg-blue-900/40 flex items-center justify-center text-sm font-bold">
                        {`${message.auteur_prenom?.[0] || ""}${message.auteur_nom?.[0] || ""}`.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium dark:text-white">
                              {message.auteur_prenom} {message.auteur_nom}
                            </span>
                            <span className="text-xs text-grayc dark:text-gray-400 ml-2">
                              {formatTimeAgo(message.date_publication)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleLikeMessage(message.id_message, post.id)}
                              disabled={likingMessageId === message.id_message || !token}
                              className="flex items-center space-x-1 text-grayc dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                              aria-label={message.user_has_liked ? "Retirer le like" : "Ajouter un like"}
                              aria-pressed={message.user_has_liked}
                            >
                              {likingMessageId === message.id_message ? (
                                <Loader className="h-3 w-3 animate-spin" />
                              ) : (
                                <Heart
                                  size={14}
                                  fill={message.user_has_liked ? "#ef4444" : "none"}
                                  color={message.user_has_liked ? "#ef4444" : "#6b7280"}
                                />
                              )}
                              <span className={`text-xs ${message.user_has_liked ? "text-red-500 dark:text-red-400 font-semibold" : ""}`}>
                                {message.nombre_likes || 0} {message.nombre_likes === 1 ? 'like' : 'likes'}
                              </span>
                            </button>
                          </div>
                        </div>

                        <p className="mt-2 text-textc dark:text-gray-300">{message.contenu_message}</p>
             
                        <div className="mt-4">
                          <button
                            onClick={() => toggleMessageComments(message.id_message)}
                            className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-2"
                            aria-expanded={expandedComments[message.id_message]}
                          >
                            <MessageSquare size={14} />
                            <span>{message.nombre_commentaires || 0} commentaire{message.nombre_commentaires !== 1 ? 's' : ''}</span>
                            {expandedComments[message.id_message] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>

                          {expandedComments[message.id_message] && (
                            <div className="ml-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                              <div className="space-y-3 mb-4">
                                {message.commentaires?.map(comment => (
                                  <div key={comment.id_commentaire} className="bg-gray-100 dark:bg-gray-800 rounded p-3">
                                    <div className="flex justify-between items-start">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue/20 dark:bg-blue-900/40 flex items-center justify-center text-xs font-bold">
                                          {`${comment.utilisateur_prenom?.[0] || ""}${comment.utilisateur_nom?.[0] || ""}`.toUpperCase()}
                                        </div>
                                        <span className="font-medium text-sm dark:text-white">
                                          {comment.utilisateur_prenom} {comment.utilisateur_nom}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {formatTimeAgo(comment.date_commpub)}
                                        </span>
                                      </div>
                                      {comment.utilisateur === userId && (
                                        <div className="relative">
                                          <button
                                            onClick={() => setShowDeleteCommentConfirm(`comment_${comment.id_commentaire}`)}
                                            disabled={deletingCommentId === comment.id_commentaire}
                                            className="text-red-400 hover:text-red-600 dark:hover:text-red-400 text-xs disabled:opacity-50"
                                            aria-label="Supprimer le commentaire"
                                          >
                                            {deletingCommentId === comment.id_commentaire ? (
                                              <Loader className="h-3 w-3 animate-spin" />
                                            ) : (
                                              <Trash2 size={12} />
                                            )}
                                          </button>
                                          
                                          {showDeleteCommentConfirm === `comment_${comment.id_commentaire}` && (
                                            <div className="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-red-200 dark:border-red-800 p-3 z-10">
                                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                                Supprimer ce commentaire ?
                                              </p>
                                              <div className="flex justify-end gap-2">
                                                <button
                                                  onClick={() => setShowDeleteCommentConfirm(null)}
                                                  className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                                >
                                                  Annuler
                                                </button>
                                                <button
                                                  onClick={() => handleDeleteComment(comment.id_commentaire, message.id_message, post.id)}
                                                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                                >
                                                  Supprimer
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    <p className="mt-2 text-sm text-textc dark:text-gray-300">{comment.contenu_comm}</p>
                                  </div>
                                ))}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder="Écrire un commentaire... (max 1000 caractères)"
                                  value={newComments[message.id_message] || ""}
                                  onChange={(e) => setNewComments(prev => ({ ...prev, [message.id_message]: e.target.value }))}
                                  onKeyPress={(e) => e.key === 'Enter' && !postingComment[message.id_message] && handlePostComment(message.id_message, post.id)}
                                  className="flex-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full px-3 py-1.5"
                                  disabled={postingComment[message.id_message] || !token}
                                  maxLength={1000}
                                />
                                <button
                                  onClick={() => handlePostComment(message.id_message, post.id)}
                                  disabled={postingComment[message.id_message] || !newComments[message.id_message]?.trim() || !token}
                                  className="bg-blue dark:bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-dark dark:hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  aria-label="Envoyer le commentaire"
                                >
                                  {postingComment[message.id_message] ? (
                                    <Loader className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Send size={14} />
                                  )}
                                </button>
                              </div>
                              {newComments[message.id_message] && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                                  {newComments[message.id_message].length}/1000 caractères
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
// Fonction utilitaire pour déterminer la cible
export const getCibleFromForumType = (forumType) => {
  const mapping = {
    "teacher-teacher": "enseignants",
    "teacher-student": "etudiants",
    "student-student": "etudiants", 
    "student-teacher": "enseignants"
  };
  return mapping[forumType] || "etudiants";
};

// Fonction utilitaire pour la validation
export const validateForumData = (title, content) => {
  const errors = [];
  
  if (!title.trim()) {
    errors.push("Le titre est requis");
  } else if (title.length > 200) {
    errors.push("Le titre ne doit pas dépasser 200 caractères");
  }
  
  if (!content.trim()) {
    errors.push("Le message est requis");
  } else if (content.length > 2000) {
    errors.push("Le message ne doit pas dépasser 2000 caractères");
  }
  
  return errors;
};

// Fonction utilitaire pour les messages de confirmation
export const getConfirmationMessage = (role, forumType) => {
  const messages = {
    "enseignant": {
      "teacher-student": "Ce forum sera visible et répondable par les étudiants. Les enseignants n'y auront pas accès. Continuer ?",
      "teacher-teacher": "Ce forum sera réservé aux enseignants seulement. Les étudiants n'y auront pas accès. Continuer ?"
    },
    "etudiant": {
      "student-teacher": "Ce forum sera visible et répondable par les enseignants. Les autres étudiants n'y auront pas accès. Continuer ?",
      "student-student": "Ce forum sera réservé aux étudiants seulement. Les enseignants n'y auront pas accès. Continuer ?"
    }
  };
  
  return messages[role]?.[forumType] || "";
};

// utils/formUtils.js - Mettez à jour la fonction getForumTypeLabel

export const getForumTypeLabel = (type) => {
  const labels = {
    'teacher-teacher': 'Enseignants ↔ Enseignants',
    'teacher-student': 'Enseignant → Étudiants',
    'student-student': 'Étudiants ↔ Étudiants',
    'student-teacher': 'Étudiant → Enseignants',
    'admin-student-forum': 'Administrateur → Étudiants',
    'admin-teacher-forum': 'Administrateur → Enseignants'
  };
  
  return labels[type] || type;
};

// utils/formUtils.js - Mettez à jour la fonction getForumTypeClasses

export const getForumTypeClasses = (type) => {
  switch(type) {
    case 'teacher-teacher': 
      return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
    case 'teacher-student': 
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
    case 'student-student': 
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
    case 'student-teacher':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
    case 'admin-student-forum':  // NOUVEAU
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
    case 'admin-teacher-forum':  // NOUVEAU
      return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800';
    default: 
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  }
};

export const formatTimeAgo = (dateString) => {
  if (!dateString) return "récemment";
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "à l'instant";
    if (diffMins < 60) return `il y a ${diffMins} min`;
    if (diffHours < 24) return `il y a ${diffHours} h`;
    if (diffDays < 7) return `il y a ${diffDays} j`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return "récemment";
  }
};
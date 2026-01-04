export const loadEditorCode = (userId, exerciseId) => {
  if (!userId || !exerciseId) return "";
  try {
    return localStorage.getItem(`editor_${userId}_${exerciseId}`) || "";
  } catch {
    return "";
  }
};

export const saveEditorCode = (userId, exerciseId, code) => {
  if (!userId || !exerciseId) return;
  try {
    localStorage.setItem(`editor_${userId}_${exerciseId}`, code);
  } catch { }
};

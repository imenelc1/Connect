export const loadStudentProfile = (exerciseId) => {
  try {
    return JSON.parse(localStorage.getItem(`profile_${exerciseId}`)) || {
      difficulties: [],
      commonErrors: [],
      hintsUsed: 0,
    };
  } catch {
    return { difficulties: [], commonErrors: [], hintsUsed: 0 };
  }
};

export const saveStudentProfile = (exerciseId, profile) => {
  localStorage.setItem(`profile_${exerciseId}`, JSON.stringify(profile));
};

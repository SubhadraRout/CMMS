const PROFILE_KEY = "cms_profile";

export function getProfile() {
  try {
    const localProfile = JSON.parse(sessionStorage.getItem(PROFILE_KEY) || "{}");
    if (localProfile && Object.keys(localProfile).length > 0) {
      return localProfile;
    }
    const user = JSON.parse(sessionStorage.getItem("cmms_user") || "{}");
    return {
      name: user.username || "",
      email: user.email || "",
      department: user.department || "",
      photo: user.photo || "",
    };
  } catch {
    return {};
  }
}

export function saveProfile(profile) {
  sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function updateProfile(patch) {
  const current = getProfile();
  const next = { ...current, ...patch };
  saveProfile(next);
  return next;
}
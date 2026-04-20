const KEY = "notifications";

export const getNotifications = () => {
  return JSON.parse(sessionStorage.getItem(KEY)) || [];
};

export const addNotification = (notification) => {
  const old = getNotifications();
  sessionStorage.setItem(KEY, JSON.stringify([notification, ...old]));
};

export const clearNotifications = () => {
  sessionStorage.removeItem(KEY);
};


export const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
};

export const setAccessToken = (token) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("accessToken", token);
};

export const removeAccessToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
};
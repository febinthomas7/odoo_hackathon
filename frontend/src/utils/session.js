export const setSession = (token, role, name, userId) => {
  // Set cookie to expire in 1 day
  const expires = new Date(Date.now() + 86400000).toUTCString();
  document.cookie = `token=${token}; expires=${expires}; path=/`;
  document.cookie = `role=${role}; expires=${expires}; path=/`;
  document.cookie = `name=${encodeURIComponent(name)}; expires=${expires}; path=/`;
  document.cookie = `userId=${userId}; expires=${expires}; path=/`;
};

export const clearSession = () => {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export const getSession = () => {
  const token = getCookie('token');
  const role = getCookie('role');
  const name = getCookie('name') ? decodeURIComponent(getCookie('name')) : null;
  const userId = getCookie('userId');
  
  return { token, role, name, userId };
};

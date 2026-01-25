export const setToken = (token) => {
  localStorage.setItem('wa_token', token);
};

export const getToken = () => {
  return localStorage.getItem('wa_token');
};

export const removeToken = () => {
  localStorage.removeItem('wa_token');
};

export const setUser = (user) => {
  localStorage.setItem('wa_user', JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem('wa_user');
  return user ? JSON.parse(user) : null;
};

export const removeUser = () => {
  localStorage.removeItem('wa_user');
};

export const logout = () => {
  removeToken();
  removeUser();
  window.location.href = '/auth';
};
import axios from "axios";

const API = "http://localhost:3000/api/auth";

export const registerApi = (data) => axios.post(`${API}/register`, data);
export const loginApi = (data) => axios.post(`${API}/login`, data);
export const changePasswordApi = (data) =>
  axios.post(`${API}/change-password`, data);

export const loginGoogle = () => axios.get(`${API}/google`);
export const loginFacebook = () => axios.get(`${API}/facebook`);
export const forgotPasswordApi = (data) => axios.post(`${API}/forgot-password`, data);
export const logoutApi = () => axios.post(`${API}/logout`);
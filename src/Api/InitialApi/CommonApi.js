import axios from "axios";
import Cookies from 'js-cookie';
import { APIURL, getHeaders } from "./config";

let isRedirectingToLogin = false;

const redirectToLogin = () => {
  if (isRedirectingToLogin) return;
  isRedirectingToLogin = true;
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {
    console.error("Error clearing storage during logout redirect:", e);
  }
  window.location.replace(process.env.React_APP_LOGOUT_URL);
};

export const apiClient = axios.create();

apiClient.interceptors.response.use(
  (response) => {
    const shouldSkipTokenUpdate = response?.config?.skipTokenUpdate;
    if (!shouldSkipTokenUpdate) {
      const requestToken = response?.data?.Data?.RequestToken;
      if (requestToken) {
        const tokenWithBearer = requestToken.startsWith('Bearer ')
          ? requestToken
          : `Bearer ${requestToken}`;
        Cookies.set('auth', tokenWithBearer);
      }
    }
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

export const CommonAPI = async (body, options = {}) => {
  try {
    const init = JSON.parse(sessionStorage.getItem("taskInit")) || {};
    const headers = await getHeaders(init, options);

    const { data } = await apiClient.post(APIURL, body, {
      headers,
      skipTokenUpdate: options?.skipTokenUpdate,
    });
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
};


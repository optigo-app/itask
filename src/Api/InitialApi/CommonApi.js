import axios from "axios";
import { APIURL, getHeaders } from "./config";
import { getAbortSignal } from "../../Utils/requestAbortController";

export const CommonAPI = async (body) => {
  try {
    const init = JSON.parse(sessionStorage.getItem("taskInit")) || {};
    const headers = getHeaders(init);

    const { data } = await axios.post(APIURL, body, { headers, signal: getAbortSignal() });
    return data;
  } catch (error) {
    if (axios.isCancel?.(error) || error.name === 'AbortError') {
      return null;
    }
    console.error("API Error:", error);
    return null;
  }
};


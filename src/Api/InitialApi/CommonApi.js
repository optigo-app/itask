import axios from "axios";
import { APIURL, getHeaders } from "./config";

export const CommonAPI = async (body) => {
  try {
    const init = JSON.parse(sessionStorage.getItem("taskInit")) || {};
    const headers = getHeaders(init); 

    const { data } = await axios.post(APIURL, body, { headers });
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
};


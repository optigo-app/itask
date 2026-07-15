import axios from "axios";
import { APIURL, getHeaders } from "./config";
import { getAuthData, getClientIpAddress } from "../../Utils/globalfun";
import { getAbortSignal } from "../../Utils/requestAbortController";

export const taskInit = async () => {
  const headers = getHeaders();
  const AuthData = getAuthData();
  const ipAddress = await getClientIpAddress();

  const body = {
    con: JSON.stringify({ id: "", mode: "gettoken", appuserid: AuthData?.uid ?? '', IPAddress: ipAddress }),
    p: "",
    f: "init api for initialization",
  };

  try {
    const { data } = await axios.post(APIURL, body, { headers, signal: getAbortSignal() });

    if (data?.Data?.rd?.[0]) {
      sessionStorage.setItem("taskInit", JSON.stringify(data.Data.rd[0]));
      sessionStorage.setItem("pageAccess", JSON.stringify(data.Data.rd1));
    } else {
      console.warn("No `rd` data found in response:", data);
    }

    return data;
  } catch (error) {
    if (axios.isCancel?.(error) || error.name === 'AbortError') {
      return null;
    }
    console.error("Error in taskInit:", error.message || error);
    return null;
  }
};

import axios from "axios";
import { APIURL, getHeaders } from "./config";
import { getAuthData } from "../../Utils/globalfun";

export const taskInit = async () => {
  const headers = getHeaders();
  const AuthData = getAuthData();

  const body = {
    con: JSON.stringify({ id: "", mode: "gettoken", appuserid: AuthData?.uid ?? '' }),
    p: "",
    f: "init api for initialization",
  };

  try {
    const { data } = await axios.post(APIURL, body, { headers });

    if (data?.Data?.rd?.[0]) {
      sessionStorage.setItem("taskInit", JSON.stringify(data.Data.rd[0]));
      sessionStorage.setItem("pageAccess", JSON.stringify(data.Data.rd1));
    } else {
      console.warn("No `rd` data found in response:", data);
    }

    return data;
  } catch (error) {
    console.error("Error in taskInit:", error.message || error);
    return null;
  }
};

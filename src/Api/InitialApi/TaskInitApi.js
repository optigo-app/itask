import { apiClient } from "./CommonApi";
import { APIURL, getHeaders } from "./config";

export const taskInit = async () => {
  const headers = await getHeaders();

  const body = {
    con: JSON.stringify({ id: "", mode: "gettoken" }),
    p: "",
    f: "init api for initialization",
  };

  try {
    const { data } = await apiClient.post(APIURL, body, { headers });

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

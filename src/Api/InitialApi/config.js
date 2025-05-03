// http://localhost:3000/?yc=e3tsaXZlLm9wdGlnb2FwcHMuY29tfX17ezIwfX17e3Byb2l0YXNrfX17e3Byb2l0YXNrfX0=&uid=amrut@eg.com&sv=1&ifid=TaskList&pid=undefined/

const isLocal = ["localhost", "nzen"].includes(window.location.hostname);



export const APIURL = !isLocal ? "http://nextjstest.web/api/report" : "https://livenx.optigoapps.com/api/report";

export const getHeaders = (init = {}) => {
  const {version = "v4", token = ""} = init;
  const AuthData = JSON.parse(localStorage.getItem("AuthqueryParams"));

  return {
    Authorization: `Bearer ${token}`,
    Yearcode: AuthData?.yc ?? "",
    Version: version,
    sv: AuthData?.sv ?? "",
    sp: "6",
  };
};

// config.js
const isLocal = ["localhost", "zen", "itask.web"]?.includes(
  window.location.hostname
);

// amrut sir api .net
// export const APIURL = isLocal
//   ? "http://zen/api/report.aspx"
//   : "https://api.optigoapps.com/ALL/report.aspx";

// node js api
// export const APIURL = isLocal
//   ? "http://zen/api/report.aspx"
//   : "https://livenx.optigoapps.com/api/report";

// export const getHeaders = (init = {}) => {
//   const { YearCode, version = "v4", token = "", sv } = init;

//   return {
//     Authorization: `Bearer ${token}`,
//     Yearcode:
//       YearCode ??
//       (isLocal
//         ? "e3t6ZW59fXt7MjB9fXt7b3JhaWwyNX19e3tvcmFpbDI1fX0="
//         : "e3tsaXZlLm9wdGlnb2FwcHMuY29tfX17ezIwfX17e3Byb2l0YXNrfX17e3Byb2l0YXNrfX0="),
//     Version: version,
//     sv: sv ?? (isLocal ? "0" : "1"),
//     sp: "6",
//   };
// };




export const APIURL = "https://livenx.optigoapps.com/api/report"; 

export const getHeaders = (init = {}) => {
  const { YearCode, version = "v4", token = "", sv } = init;

  return {
    Authorization: `Bearer ${token}`,
    Yearcode: "e3tsaXZlLm9wdGlnb2FwcHMuY29tfX17ezIwfX17e3Byb2l0YXNrfX17e3Byb2l0YXNrfX0=",
    Version: version,
    sv: sv ?? "1",
    sp: "6",
  };
};

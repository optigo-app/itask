
// https://testitask.optigoapps.com/?yc=e3t6ZW59fXt7MjB9fXt7b3JhaWwyNX19e3tvcmFpbDI1fX0=-oLZb5KUH/Ig=&uid=amVuaXNAZWcuY29t-ETMUlim8gZA=&sv=1&ifid=TaskList&pid=undefined
const isLocal = ["localhost", "zen", "itask.web"]?.includes(
  window.location.hostname
);


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

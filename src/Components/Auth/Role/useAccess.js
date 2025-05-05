import { useRecoilValue } from "recoil";
import { userRoleAtom } from "../../../Recoil/atom";

const useAccess = () => {
  const role = useRecoilValue(userRoleAtom);

  const hasAccess = (allowedRoles = []) => {
    return allowedRoles
      .map(r => r.toLowerCase())
      .includes(role?.toLowerCase());
  };

  return { role, hasAccess };
};

export default useAccess;

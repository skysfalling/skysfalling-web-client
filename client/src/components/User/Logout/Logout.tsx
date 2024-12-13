import { useContext } from "react";
import AuthService from "../../../classes/services/AuthService";
import { AuthContext } from "src/context/AuthContext";

export function Logout() {
  const { setAuthContext } = useContext(AuthContext);
  return <div>
    <button onClick={
      async () => {
        await AuthService.Logout(setAuthContext);
      }
    }>Logout</button>
  </div>
}

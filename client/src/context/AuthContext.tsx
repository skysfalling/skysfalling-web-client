import { createContext } from "react";
import { IUserData } from "@shared/interfaces";

/** Define the values of the AuthContext */
export type AuthContextValues = {
  status: boolean,
  user?: IUserData,
}

/** Define the props of the AuthContext constant */
export type AuthContextProps = AuthContextValues & {
  setAuthContext: (values: AuthContextValues) => void
}

/** Create the AuthContext constant */
export const AuthContext = createContext<AuthContextProps>({
  status: false,
  user: undefined,
  setAuthContext: (values: AuthContextValues) => {}
});


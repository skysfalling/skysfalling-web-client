export const NetworkSettings = {
  clientUrl: process.env.REACT_APP_CLIENT_URL,
  serverUrl: process.env.REACT_APP_SERVER_URL,
  googleClientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
};

export const UserSettings = {
  name: {
    minLength: 2,
    maxLength: 22,
  },
  password: {
    minLength: 8,
    maxLength: 22,
  },
  accessTokenKey: "accessToken",
};
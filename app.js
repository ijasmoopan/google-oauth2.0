import * as dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch";
dotenv.config();

const app = express();

app.use(express.json());

const GOOGLE_OAUTH_URL = process.env.GOOGLE_OAUTH_URL;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CALLBACK_URL = "http://localhost:3000/auth/google/callback";
const GOOGLE_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_ACCESS_TOKEN_URL = process.env.GOOGLE_ACCESS_TOKEN_URL;

app.get("/", async (req, res) => {
  const state = "some_state";
  const scopes = GOOGLE_OAUTH_SCOPES.join(" ");
  const GOOGLE_OAUTH_CONSENT_SCREEN_URL = `${GOOGLE_OAUTH_URL}?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_CALLBACK_URL}&access_type=offline&response_type=code&state=${state}&scope=${scopes}`;

  // res.send("Sign in with Google");

  res.redirect(GOOGLE_OAUTH_CONSENT_SCREEN_URL);
});

app.get("/auth/google/callback", async (req, res) => {
  // res.send("Google OAuth Callback URL!");

  console.log(req.query);

  const { code } = req.query;

  const data = {
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: "http://localhost:3000/auth/google/callback",
    grant_type: "authorization_code",
  };
  console.log({ data });

  const response = await fetch(GOOGLE_ACCESS_TOKEN_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });

  const accessTokenData = await response.json();

  console.log({ accessTokenData });

  const { id_token } = accessTokenData;

  const tokenInfoResponse = await fetch(
    `${process.env.GOOGLE_TOKEN_INFO_URL}?id_token=${id_token}`
  );

  console.log({ tokenInfoResponse });

  res.status(tokenInfoResponse.status).json(await tokenInfoResponse.json());

  // res.redirect("/home");
});

app.get("/home", async (req, res) => {
  res.send("HOME PAGE!");
});

const PORT = process.env.PORT || 3000;

const start = async (port) => {
  app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });
};

start(PORT);

const crypto = require("crypto");

const SITE_PASSWORD =
  process.env.SITE_PASSWORD || "penguins";

function getAuthToken() {
  return crypto
    .createHash("sha256")
    .update(`honeydo:${SITE_PASSWORD}`)
    .digest("hex");
}

function checkPassword(password) {
  return typeof password === "string" && password.trim() === SITE_PASSWORD;
}

function checkToken(token) {
  return typeof token === "string" && token === getAuthToken();
}

function getTokenFromRequest(headers = {}) {
  const auth =
    headers.authorization ||
    headers.Authorization ||
    "";
  const match = String(auth).match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

module.exports = {
  checkPassword,
  checkToken,
  getAuthToken,
  getTokenFromRequest,
};

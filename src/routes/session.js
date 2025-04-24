const session = require("../controllers/session")
const { Router } = require("express");

const app = Router();

app.post("/register", session.register);
app.post("/login", session.login);
app.put("/logout", session.logout);
app.post("/verify_otp", session.verifyOtp);
app.post("/verify_mobile_otp", session.verifyMobileOtp);

app.post("/resend_otp", session.resendOTP);

module.exports = app;
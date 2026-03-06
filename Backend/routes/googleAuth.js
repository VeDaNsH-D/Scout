const express = require("express");
const passport = require("passport");
const generateToken = require("../utils/generate_token");

const router = express.Router();

function getFrontendUrl() {
    return process.env.FRONTEND_URL || "http://localhost:5173";
}

function redirectWithOAuthError(res, message) {
    const frontendURL = getFrontendUrl();
    const reason = message || "Google authentication failed";
    return res.redirect(`${frontendURL}/login?oauthError=${encodeURIComponent(reason)}`);
}

router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        prompt: "select_account"
    })
);

router.get("/google/callback", (req, res, next) => {
    passport.authenticate("google", { session: false }, (error, user) => {
        if (error) {
            console.error("[Google OAuth] Callback error:", error.message);
            return redirectWithOAuthError(res, error.message);
        }

        if (!user) {
            return redirectWithOAuthError(res, "No user returned from Google");
        }

        const token = generateToken(user);
        const frontendURL = getFrontendUrl();
        return res.redirect(`${frontendURL}/login?token=${encodeURIComponent(token)}`);
    })(req, res, next);
});

module.exports = router;
const express = require("express");
const passport = require("passport");
const generateToken = require("../utils/generate_token");

const router = express.Router();

router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {

        const token = generateToken(req.user);

        const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
        res.redirect(`${frontendURL}/login?token=${encodeURIComponent(token)}`);

    }
);

module.exports = router;
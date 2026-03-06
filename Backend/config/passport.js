const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("../schemas/user_schema");

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile, done) => {

            try {

                const email = profile?.emails?.[0]?.value?.toLowerCase() || null;
                const fullName = profile?.displayName || null;

                if (!email) {
                    return done(new Error("Google account email is required"), null);
                }

                let user = await User.findOne({
                    $or: [{ googleId: profile.id }, ...(email ? [{ email }] : [])]
                });

                if (!user) {
                    user = await User.create({
                        googleId: profile.id,
                        full_name: fullName,
                        email,
                        company_name: null,
                        company_website: null
                    });
                } else if (!user.googleId) {
                    user.googleId = profile.id;
                    if (!user.full_name && fullName) {
                        user.full_name = fullName;
                    }
                    await user.save();
                }

                return done(null, user);

            } catch (error) {
                done(error, null);
            }

        }
    )
);

module.exports = passport;
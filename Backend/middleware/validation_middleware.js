const validateObjectId = (paramName = "id") => (req, res, next) => {
    const value = req.params[paramName];
    const objectIdRegex = /^[a-f\d]{24}$/i;

    if (!value || !objectIdRegex.test(value)) {
        return res.status(400).json({
            message: `Invalid ${paramName}`
        });
    }

    return next();
};

const requireFields = (fields = []) => (req, res, next) => {
    const missing = fields.filter((field) => {
        const value = req.body[field];
        return value === undefined || value === null || value === "";
    });

    if (missing.length > 0) {
        return res.status(400).json({
            message: `Missing required fields: ${missing.join(", ")}`
        });
    }

    return next();
};

module.exports = {
    validateObjectId,
    requireFields
};

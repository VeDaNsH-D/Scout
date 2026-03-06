const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || (err.name === "MulterError" ? 400 : 500);

    if (res.headersSent) {
        return next(err);
    }

    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);

    return res.status(statusCode).json({
        message: err.message || "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
};

const notFound = (req, res, next) => {
    const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    err.statusCode = 404;
    next(err);
};

module.exports = {
    errorHandler,
    notFound
};

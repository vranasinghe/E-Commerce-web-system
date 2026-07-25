import rateLimit from "express-rate-limit";

// Rate limiter for authentication / login endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: {
    error: "Too many login attempts from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for intensive AI processing operations (try-on, visual search)
export const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 requests per window
  message: {
    error: "Too many AI requests from this IP, please wait a minute before trying again",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

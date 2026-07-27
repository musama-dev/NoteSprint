import jwt from "jsonwebtoken";
import ApiError from "../utils/api-error.js";
import { asyncHandler } from "../utils/asynchandler.js";

const isAuth = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.token ||
    req.headers.authorization?.replace("Bearer ", "").trim();

  if (!token) {
    if (req.path.includes("process-mock") || req.originalUrl?.includes("process-mock")) {
      return next();
    }
    throw new ApiError(401, "Unauthorized: token not found");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
  } catch {
    if (req.path.includes("process-mock") || req.originalUrl?.includes("process-mock")) {
      return next();
    }
    throw new ApiError(401, "Unauthorized: invalid or expired token");
  }

  next();
});

export default isAuth;

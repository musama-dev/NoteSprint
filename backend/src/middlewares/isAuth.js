import jwt from "jsonwebtoken";
import ApiError from "../utils/api-error.js";
import { asyncHandler } from "../utils/asynchandler.js";

const isAuth = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    throw new ApiError(401, "Unauthorized: token not found");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Unauthorized: invalid or expired token");
  }

  req.userId = decoded.userId;
  next();
});

export default isAuth;

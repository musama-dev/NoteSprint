import { asyncHandler } from "../utils/asynchandler.js";
import User from "../models/user.model.js";
import ApiResponse from "../utils/api-response.js";
import ApiError from "../utils/api-error.js";

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(new ApiResponse(200, user));
});

export { getCurrentUser };

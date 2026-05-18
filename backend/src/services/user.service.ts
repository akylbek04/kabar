import UserModel from "../models/user.model";

export const findByIdUserService = async (userId: string) => {
  return await UserModel.findById(userId);
};

export const getUsersService = async (userId: string) => {
  const users = await UserModel.find({ _id: { $ne: userId } }).select(
    "-password"
  );

  return users;
};

export const updateProfileService = async (
  userId: string,
  data: {
    name?: string;
    description?: string;
    status?: string;
    avatar?: string;
  }
) => {
  const user = await UserModel.findByIdAndUpdate(userId, data, {
    new: true,
  }).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

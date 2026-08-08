import mongoose, { HydratedDocument, Model, Schema } from "mongoose";
import { compareValue, hashValue } from "../utils/bcrypt";

export interface UserAttrs {
  name: string;
  email: string;
  password: string;
  avatar?: string | null;
  description?: string | null;
  status?: string | null;
}

export interface UserMethods {
  comparePassword(value: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<UserAttrs, UserMethods>;
type UserModelType = Model<UserAttrs, {}, UserMethods>;

const userSchema = new Schema<UserAttrs, UserModelType, UserMethods>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    avatar: { type: String, default: null },
    description: { type: String, default: null, maxlength: 200 },
    status: { type: String, default: null, maxlength: 100 },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        if (ret) delete (ret as any).password;
        return ret;
      },
    },
  }
);

userSchema.pre("save", async function (next) {
  if (this.password && this.isModified("password")) {
    this.password = await hashValue(this.password);
  }
  next();
});

userSchema.methods.comparePassword = async function (val: string) {
  return compareValue(val, this.password);
};

const UserModel = mongoose.model<UserAttrs, UserModelType>("User", userSchema);
export default UserModel;
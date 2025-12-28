// import mongoose, { Schema } from "mongoose";
// const authSchema = new Schema(
//   {
//     fullName: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },

//     password: {
//       type: String,
//       required: true,
//       select: false, // important for security
//     },

//     role: {
//       type: String,
//       enum: Object.values(UserRole),
//       default: UserRole.USER,
//     },

//     isActive: {
//       type: Boolean,
//       default: true,
//     },

//     isEmailVerified: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// export const UserModel = mongoose.model("User", authSchema);

import express from "express";
import isAuth from "../Middlewares/isAuth.js";
import { upload } from "../Middlewares/Multer.js";

import {
  addSubscriptionPlans,
  followUser,
  getAllFriends,
  getprofile,
  getSuggestedPeople,
  getUserById,
  searchUsers,
  unfollowUser,
  updateCoverPhoto,
  updateIntro,
  updateLastActive,
  updateProfilePhoto
} from "../Controllers/User.Controller.js";

const userrouter = express.Router();

userrouter.get('/profile/:userId', getprofile);
userrouter.post('/update/profilepic', isAuth, upload.single('profileimage'), updateProfilePhoto);
userrouter.post('/update/coverpic', isAuth, upload.single('coverimage'), updateCoverPhoto);
userrouter.put('/update-intro', isAuth, updateIntro);
userrouter.post('/follow/:id', isAuth, followUser);
userrouter.post('/unfollow/:id', isAuth, unfollowUser);
userrouter.get('/suggestions', isAuth, getSuggestedPeople);
userrouter.get('/friends/:id', isAuth, getUserById);
userrouter.get('/friends', isAuth, getAllFriends);
userrouter.get('/search', isAuth, searchUsers);
userrouter.post('/subscription-plans',isAuth,addSubscriptionPlans);
userrouter.post("/active", isAuth, updateLastActive);

export default userrouter;
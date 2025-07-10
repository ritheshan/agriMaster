// File: server/routes/community.js
import express from "express";
import multer from "multer";
import {
  authMiddleware,
  authorizeRoles,
} from "../middleware/auth.middleware.js";
import * as communityController from "../controllers/community.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/post",
  authMiddleware,
  upload.fields([{ name: "image" }, { name: "video" }]),
  communityController.createPost
);
router.get("/posts", communityController.getPosts);
router.get("/post/:id", communityController.getPostById);
router.post(
  "/post/:id/comment",
  authMiddleware,
  communityController.addComment
);
router.post("/post/:id/like", authMiddleware, communityController.toggleLike);
router.post(
  "/post/:id/verify",
  authMiddleware,
  authorizeRoles("expert", "admin"),
  communityController.verifyPost
);
router.delete("/post/:id", authMiddleware, communityController.deletePost);
router.post(
  "/promote/:userId",
  authMiddleware,
  authorizeRoles("admin"),
  communityController.promoteUser
);

export default router;

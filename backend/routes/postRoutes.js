const express=require('express');
const router=express.Router();
const {
  createPost,
  getAllPosts,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
} = require("../controllers/postController");
const { protect }=require('../middleware/authMiddleware.js');
const upload = require('../middleware/upload.js');
router.post('/', protect, upload.single('image'), createPost);
router.put("/:postId", protect, upload.single("image"), updatePost);
router.get('/', protect, getAllPosts);
router.delete("/:postId", protect, deletePost);
router.put("/like", protect, toggleLike);
router.post("/:postId/comment", protect, addComment);


module.exports=router;
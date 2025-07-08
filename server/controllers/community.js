// File: server/controllers/communityController.js

import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import { cloudinary } from '../config/cloudinary.js';
import multer from 'multer';
import { storage } from '../config/cloudinary.js';

const upload = multer({ storage: storage });

export const createPost = async (req, res) => {
  try {
    const { text, tags, type } = req.body;
    
    // Upload to Cloudinary
    let imageUrl, videoUrl;
    
    if (req.files?.image) {
      const result = await cloudinary.uploader.upload(req.files.image[0].path, {
        folder: 'agrimaster/posts/images'
      });
      imageUrl = result.secure_url;
    }
    
    if (req.files?.video) {
      const result = await cloudinary.uploader.upload(req.files.video[0].path, {
        folder: 'agrimaster/posts/videos',
        resource_type: 'video'
      });
      videoUrl = result.secure_url;
    }

    const post = await Post.create({
      user: req.user.id,
      text,
      tags: tags ? tags.split(',') : [],
      image: imageUrl,
      video: videoUrl,
      type: type || 'post'
    });

    res.status(201).json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    const { type, tag, search, sortBy = 'createdAt', order = 'desc', page = 1, limit = 10 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (tag) filter.tags = tag;
    if (search) filter.text = { $regex: search, $options: 'i' };

    const posts = await Post.find(filter)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user');

    res.json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user');
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
    post.views++;
    await post.save();

    const comments = await Comment.find({ post: post._id }).populate('user');
    res.json({ success: true, data: { post, comments } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const comment = await Comment.create({
      post: req.params.id,
      user: req.user.id,
      text: req.body.text,
      parentComment: req.body.parentComment || null
    });
    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.user.id;
    if (post.likes.includes(userId)) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }
    await post.save();
    res.json({ success: true, data: post.likes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const verifyPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

    post.verified = true;
    post.expertNote = req.body.expertNote;
    await post.save();

    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

    if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    await post.remove();
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const promoteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.role = 'expert';
    await user.save();

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
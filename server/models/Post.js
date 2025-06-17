import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String },
    image: { type: String },
    video: { type: String },
    tags: [String],
    type: { type: String, default: 'post' }, // distinguishes from reels
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    verified: { type: Boolean, default: false },
    expertNote: { type: String }
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);
export default Post;
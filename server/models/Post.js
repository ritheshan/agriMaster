import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String },
    image: {
      type: String,  // Will store Cloudinary URL
      validate: {
        validator: function (v) {
          return !v || v.startsWith('https://res.cloudinary.com/');
        },
        message: 'Invalid image URL'
      }
    },
    video: {
      type: String,  // Will store Cloudinary URL
      validate: {
        validator: function (v) {
          return !v || v.startsWith('https://res.cloudinary.com/');
        },
        message: 'Invalid video URL'
      }
    },
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

postSchema.pre('remove', async function(next) {
  try {
    if (this.image) {
      const publicId = this.image.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy(`agrimaster/posts/images/${publicId}`);
    }
    if (this.video) {
      const publicId = this.video.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy(`agrimaster/posts/videos/${publicId}`, { resource_type: 'video' });
    }
    next();
  } catch (error) {
    next(error);
  }
});
const Post = mongoose.model('Post', postSchema);
export default Post;
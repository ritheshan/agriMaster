import mongoose from 'mongoose';

const reelSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    video: { type: String, required: true },
    caption: { type: String },
    tags: [String],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    shares: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Reel = mongoose.model('Reel', reelSchema);
export default Reel;
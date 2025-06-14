import mongoose from 'mongoose';

const growthLogSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  note: {
    type: String,
    trim: true
  },
  image: {
    type: String, // Cloudinary/S3 URL
    trim: true
  }
}, { _id: false });

const cropRecordSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cropName: {
    type: String,
    required: true,
    trim: true
  },
  sowingDate: {
    type: Date,
    required: true
  },
  expectedHarvestDate: {
    type: Date
  },
  actualHarvestDate: {
    type: Date
  },
  area: {
    type: Number, // acres or hectares
    min: 0
  },
  status: {
    type: String,
    enum: ['growing', 'harvested', 'failed'],
    default: 'growing'
  },
  notes: {
    type: String,
    trim: true
  },
  photos: [{
    type: String, // URLs to images
    trim: true
  }],
  growthLogs: [growthLogSchema],
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    pincode: { type: String, required: true }
  }
}, { timestamps: true });

const CropRecord = mongoose.model('CropRecord', cropRecordSchema);

export default CropRecord;
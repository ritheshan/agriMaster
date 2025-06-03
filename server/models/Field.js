// server/models/Field.js
import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]  // [longitude, latitude]
  },
  area: { type: Number, required: true }, // in acres/hectares
  soilType: String,
  currentCrop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
  plantingDate: Date,
  expectedHarvestDate: Date,
  healthHistory: [{
    date: Date,
    status: String,
    issues: [String],
    images: [String]
  }]
}, { timestamps: true });

fieldSchema.index({ location: '2dsphere' });
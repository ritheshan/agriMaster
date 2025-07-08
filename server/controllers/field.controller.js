// server/controllers/fieldController.js
import Field from '../models/Field.js';
import { cloudinary } from '../config/cloudinary.js';

// Create new field
export const createField = async (req, res) => {
  try {
    const {
      name,
      coordinates,
      area,
      soilType,
      currentCrop,
      plantingDate,
      expectedHarvestDate
    } = req.body;

    const field = await Field.create({
      user: req.user.id,
      name,
      location: {
        type: 'Point',
        coordinates: coordinates // [longitude, latitude]
      },
      area,
      soilType,
      currentCrop,
      plantingDate,
      expectedHarvestDate,
      healthHistory: []
    });

    res.status(201).json({
      success: true,
      data: field
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Get all fields for a user
export const getFields = async (req, res) => {
  try {
    const fields = await Field.find({ user: req.user.id })
      .populate('currentCrop')
      .sort('-createdAt');

    res.json({
      success: true,
      count: fields.length,
      data: fields
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Get single field
export const getField = async (req, res) => {
  try {
    const field = await Field.findById(req.params.id)
      .populate('currentCrop')
      .populate('user', 'name email');

    if (!field) {
      return res.status(404).json({
        success: false,
        error: 'Field not found'
      });
    }

    // Check ownership
    if (field.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this field'
      });
    }

    res.json({
      success: true,
      data: field
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Update field
export const updateField = async (req, res) => {
  try {
    let field = await Field.findById(req.params.id);

    if (!field) {
      return res.status(404).json({
        success: false,
        error: 'Field not found'
      });
    }

    // Check ownership
    if (field.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this field'
      });
    }

    field = await Field.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: field
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Add health record
export const addHealthRecord = async (req, res) => {
  try {
    const field = await Field.findById(req.params.id);

    if (!field) {
      return res.status(404).json({
        success: false,
        error: 'Field not found'
      });
    }

    // Check ownership
    if (field.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this field'
      });
    }

    // Upload images to Cloudinary
    const imageUrls = [];
    if (req.files) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'agrimaster/fields/health'
        });
        imageUrls.push(result.secure_url);
      }
    }

    const healthRecord = {
      date: new Date(),
      status: req.body.status,
      issues: req.body.issues,
      images: imageUrls
    };

    field.healthHistory.push(healthRecord);
    await field.save();

    res.status(201).json({
      success: true,
      data: field
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Get nearby fields
export const getNearbyFields = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query; // maxDistance in meters

    const fields = await Field.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).populate('currentCrop');

    res.json({
      success: true,
      count: fields.length,
      data: fields
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
import CropRecord from '../models/cropRecordModel.js';
import User from '../models/User.js';

// POST /farmer/crops-interested
export const addCropsInterested = async (req, res) => {
  try {
    const userId = req.user.id;
    const { crops } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { cropsInterested: { $each: crops } } },
      { new: true }
    );
    res.json({ cropsInterested: user.cropsInterested });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update crops of interest' });
  }
};

// GET /farmer/crops-interested
export const getCropsInterested = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('cropsInterested');
    res.json({ cropsInterested: user.cropsInterested });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch crops of interest' });
  }
};

// POST /crop-record
export const createCropRecord = async (req, res) => {
  try {
    const newRecord = new CropRecord({ ...req.body, farmer: req.user.id });
    await newRecord.save();

    await User.findByIdAndUpdate(req.user.id, {
      $push: { cropRecords: newRecord._id }
    });

    res.status(201).json(newRecord);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create crop record' });
  }
};

// GET /crop-record/:id
export const getCropRecordById = async (req, res) => {
  try {
    const record = await CropRecord.findOne({
      _id: req.params.id,
      farmer: req.user.id
    });
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch crop record' });
  }
};

// PUT /crop-record/:id
export const updateCropRecord = async (req, res) => {
  try {
    const updated = await CropRecord.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Record not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update crop record' });
  }
};

// POST /crop-record/:id/upload-photo
export const addPhotoToCropRecord = async (req, res) => {
  try {
    const { note, image } = req.body;
    const record = await CropRecord.findOne({ _id: req.params.id, farmer: req.user.id });

    if (!record) return res.status(404).json({ error: 'Record not found' });

    record.growthLogs.push({ note, image });
    await record.save();

    res.json({ message: 'Photo added', growthLogs: record.growthLogs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add photo' });
  }
};

// GET /crop-record?status=growing
export const getCropRecordsByStatus = async (req, res) => {
  try {
    const records = await CropRecord.find({
      farmer: req.user.id,
      ...(req.query.status && { status: req.query.status })
    });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch crop records' });
  }
};
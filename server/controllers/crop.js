import CropRecord from '../models/Crop.js';
import User from '../models/User.js';
import Field from '../models/Field.js';
import { cloudinary } from '../config/cloudinary.js';

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
    const {
      fieldId,
      cropName,
      variety,
      sowingDate,
      expectedHarvestDate,
      area,
      location,
      expectedYield
    } = req.body;

    // Generate growth stages
    const growthStages = generateGrowthStages(cropName, sowingDate, expectedHarvestDate);

    const newRecord = new CropRecord({
      farmer: req.user.id,
      field: fieldId,
      cropName,
      variety,
      sowingDate,
      expectedHarvestDate,
      area,
      location,
      growthStages,
      yield: {
        expected: expectedYield,
        unit: 'kg'
      }
    });

    await newRecord.save();

    await User.findByIdAndUpdate(req.user.id, {
      $push: { cropRecords: newRecord._id }
    });

    res.status(201).json({
      success: true,
      data: newRecord
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message || 'Failed to create crop record' 
    });
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

// GET /crop-calendar
export const getCropCalendar = async (req, res) => {
  try {
    const startDate = new Date(req.query.start || new Date());
    const endDate = new Date(req.query.end || new Date());
    endDate.setMonth(endDate.getMonth() + 3); // Default 3 months ahead

    const crops = await CropRecord.find({
      farmer: req.user.id,
      $or: [
        { sowingDate: { $gte: startDate, $lte: endDate } },
        { expectedHarvestDate: { $gte: startDate, $lte: endDate } },
        { 'tasks.plannedDate': { $gte: startDate, $lte: endDate } }
      ]
    }).populate('field');

    const events = [];

    crops.forEach(crop => {
      // Add sowing event
      events.push({
        id: `sow-${crop._id}`,
        title: `Sow ${crop.cropName}`,
        start: crop.sowingDate,
        type: 'sowing',
        crop: crop._id,
        field: crop.field?.name || 'Field',
        status: 'scheduled'
      });

      // Add harvest event
      if (crop.expectedHarvestDate) {
        events.push({
          id: `harvest-${crop._id}`,
          title: `Harvest ${crop.cropName}`,
          start: crop.expectedHarvestDate,
          type: 'harvest',
          crop: crop._id,
          field: crop.field?.name || 'Field',
          status: crop.status === 'harvested' ? 'completed' : 'scheduled'
        });
      }

      // Add growth stage events
      crop.growthStages.forEach(stage => {
        events.push({
          id: `stage-${crop._id}-${stage.name}`,
          title: `${stage.name} - ${crop.cropName}`,
          start: stage.startDate,
          type: 'growth_stage',
          crop: crop._id,
          field: crop.field?.name || 'Field',
          status: stage.completed ? 'completed' : 'scheduled',
          healthStatus: stage.healthStatus
        });
      });

      // Add task events
      crop.tasks.forEach(task => {
        if (task.plannedDate >= startDate && task.plannedDate <= endDate) {
          events.push({
            id: `task-${task._id}`,
            title: task.title,
            start: task.plannedDate,
            type: 'task',
            status: task.status,
            priority: task.priority,
            crop: crop._id,
            field: crop.field?.name || 'Field',
            description: task.description
          });
        }
      });
    });

    res.json({
      success: true,
      data: events
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// PUT /crop-record/:id/growth-stage
export const updateGrowthStage = async (req, res) => {
  try {
    const crop = await CropRecord.findOne({
      _id: req.params.id,
      farmer: req.user.id
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        error: 'Crop not found or unauthorized'
      });
    }

    const { stageName, healthStatus, notes, completed } = req.body;

    // Upload images if provided
    let images = [];
    if (req.files) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'agrimaster/crops/stages'
        });
        images.push({
          url: result.secure_url,
          date: new Date()
        });
      }
    }

    await crop.updateGrowthStage({
      name: stageName,
      healthStatus,
      notes,
      images,
      completed
    });

    res.json({
      success: true,
      data: crop
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// POST /crop-record/:id/growth-log
export const addGrowthLog = async (req, res) => {
  try {
    const crop = await CropRecord.findOne({
      _id: req.params.id,
      farmer: req.user.id
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        error: 'Crop not found or unauthorized'
      });
    }

    let imageUrl;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'agrimaster/crops/logs'
      });
      imageUrl = result.secure_url;
    }

    const growthLog = {
      date: new Date(),
      note: req.body.note,
      image: imageUrl,
      healthStatus: req.body.healthStatus,
      measurements: req.body.measurements ? JSON.parse(req.body.measurements) : undefined
    };

    crop.growthLogs.push(growthLog);
    await crop.save();

    res.status(201).json({
      success: true,
      data: growthLog
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// POST /crop-record/:id/task
export const addTask = async (req, res) => {
  try {
    const crop = await CropRecord.findOne({
      _id: req.params.id,
      farmer: req.user.id
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        error: 'Crop not found or unauthorized'
      });
    }

    const taskData = {
      type: req.body.type,
      title: req.body.title,
      description: req.body.description,
      plannedDate: new Date(req.body.plannedDate),
      priority: req.body.priority || 'medium'
    };

    await crop.addTask(taskData);

    res.status(201).json({
      success: true,
      data: crop
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// PUT /crop-record/:cropId/task/:taskId
export const updateTaskStatus = async (req, res) => {
  try {
    const crop = await CropRecord.findOne({
      _id: req.params.cropId,
      farmer: req.user.id
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        error: 'Crop not found or unauthorized'
      });
    }

    await crop.updateTaskStatus(req.params.taskId, req.body.status);

    res.json({
      success: true,
      data: crop
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// GET /crop-notifications
export const getCropNotifications = async (req, res) => {
  try {
    const crops = await CropRecord.find({ farmer: req.user.id });
    const notifications = [];

    for (const crop of crops) {
      const taskNotifications = crop.checkTaskNotifications();
      
      taskNotifications.forEach(task => {
        notifications.push({
          type: 'task_reminder',
          title: `Task Due: ${task.title}`,
          message: `${task.title} is due for ${crop.cropName}`,
          priority: task.priority,
          cropId: crop._id,
          taskId: task._id,
          dueDate: task.plannedDate
        });
      });

      // Check for growth stage transitions
      const currentStage = crop.growthStages.find(stage => 
        stage.name === crop.currentStage && !stage.completed
      );
      
      if (currentStage) {
        const expectedCompletionDate = new Date(currentStage.startDate);
        expectedCompletionDate.setDate(expectedCompletionDate.getDate() + currentStage.expectedDuration);
        
        if (expectedCompletionDate <= new Date()) {
          notifications.push({
            type: 'growth_stage_update',
            title: `Growth Stage Update Required`,
            message: `Please update the ${currentStage.name} stage for ${crop.cropName}`,
            priority: 'medium',
            cropId: crop._id,
            stageName: currentStage.name
          });
        }
      }
    }

    res.json({
      success: true,
      data: notifications
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Helper function to generate growth stages
const generateGrowthStages = (cropName, sowingDate, expectedHarvestDate) => {
  const totalDays = (new Date(expectedHarvestDate) - new Date(sowingDate)) / (1000 * 60 * 60 * 24);
  
  // Default growth stage durations (percentages of total growth period)
  const stageDurations = {
    germination: 0.1,    // 10%
    seedling: 0.15,      // 15%
    vegetative: 0.3,     // 30%
    flowering: 0.2,      // 20%
    fruiting: 0.15,      // 15%
    ripening: 0.1        // 10%
  };

  let currentDate = new Date(sowingDate);
  const stages = [];

  Object.entries(stageDurations).forEach(([stageName, duration]) => {
    const stageDays = Math.round(totalDays * duration);
    stages.push({
      name: stageName,
      startDate: new Date(currentDate),
      expectedDuration: stageDays,
      completed: false,
      healthStatus: 'good'
    });
    currentDate.setDate(currentDate.getDate() + stageDays);
  });

  return stages;
};
import mongoose from 'mongoose';

const growthStageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['germination', 'seedling', 'vegetative', 'flowering', 'fruiting', 'ripening']
  },
  startDate: {
    type: Date,
    required: true
  },
  completionDate: Date,
  expectedDuration: Number, // in days
  completed: {
    type: Boolean,
    default: false
  },
  healthStatus: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'critical'],
    default: 'good'
  },
  images: [{
    url: String,
    date: Date
  }],
  notes: String
});

const taskSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['irrigation', 'fertilization', 'pesticide', 'weeding', 'pruning', 'harvesting', 'other']
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  plannedDate: Date,
  completedDate: Date,
  status: {
    type: String,
    enum: ['pending', 'completed', 'overdue', 'skipped'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  notificationSent: {
    type: Boolean,
    default: false
  }
});

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
  },
  healthStatus: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'critical'],
    default: 'good'
  },
  measurements: {
    height: Number,
    leafCount: Number,
    temperature: Number,
    humidity: Number,
    soilMoisture: Number
  }
}, { _id: false });

const cropRecordSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field'
  },
  cropName: {
    type: String,
    required: true,
    trim: true
  },
  variety: {
    type: String,
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
    value: {
      type: Number,
      min: 0
    },
    unit: {
      type: String,
      enum: ['acres', 'hectares', 'squareMeters'],
      default: 'acres'
    }
  },
  status: {
    type: String,
    enum: ['planning', 'growing', 'harvested', 'failed'],
    default: 'growing'
  },
  growthStages: [growthStageSchema],
  currentStage: {
    type: String,
    enum: ['germination', 'seedling', 'vegetative', 'flowering', 'fruiting', 'ripening']
  },
  tasks: [taskSchema],
  notes: {
    type: String,
    trim: true
  },
  photos: [{
    type: String, // URLs to images
    trim: true
  }],
  growthLogs: [growthLogSchema],
  yield: {
    expected: Number,
    actual: Number,
    unit: {
      type: String,
      enum: ['kg', 'tons', 'quintals'],
      default: 'kg'
    }
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    pincode: { type: String, required: true }
  }
}, { timestamps: true });

// Middleware to update currentStage based on growthStages
cropRecordSchema.pre('save', function(next) {
  if (this.growthStages && this.growthStages.length > 0) {
    const currentDate = new Date();
    const currentStage = this.growthStages
      .filter(stage => stage.startDate <= currentDate && (!stage.completionDate || stage.completionDate >= currentDate))
      .sort((a, b) => b.startDate - a.startDate)[0];
    
    if (currentStage) {
      this.currentStage = currentStage.name;
    }
  }
  next();
});

// Method to check if tasks need notifications
cropRecordSchema.methods.checkTaskNotifications = function() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.tasks.filter(task => {
    return task.status === 'pending' &&
           !task.notificationSent &&
           task.plannedDate <= tomorrow;
  });
};

// Method to update growth stage
cropRecordSchema.methods.updateGrowthStage = function(stageData) {
  const stage = this.growthStages.find(s => s.name === stageData.name);
  if (stage) {
    Object.assign(stage, stageData);
    if (stageData.completed) {
      stage.completionDate = new Date();
    }
    return this.save();
  }
};

// Method to add task
cropRecordSchema.methods.addTask = function(taskData) {
  this.tasks.push(taskData);
  return this.save();
};

// Method to update task status
cropRecordSchema.methods.updateTaskStatus = function(taskId, status) {
  const task = this.tasks.id(taskId);
  if (task) {
    task.status = status;
    if (status === 'completed') {
      task.completedDate = new Date();
    }
    return this.save();
  }
};

const CropRecord = mongoose.model('CropRecord', cropRecordSchema);

export default CropRecord;
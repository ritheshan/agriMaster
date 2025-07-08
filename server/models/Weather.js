import mongoose from 'mongoose';

const weatherAlertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['RAIN', 'DROUGHT', 'FROST', 'HEAT', 'STORM', 'PEST_RISK'],
    required: true
  },
  severity: {
    type: String,
    enum: ['LOW', 'MODERATE', 'HIGH', 'SEVERE'],
    required: true
  },
  message: String,
  startDate: Date,
  endDate: Date,
  affectedFields: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field'
  }]
});

const weatherDataSchema = new mongoose.Schema({
  fieldId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field',
    required: true
  },
  date: { type: Date, required: true },
  temperature: {
    current: Number,
    min: Number,
    max: Number,
    feelsLike: Number
  },
  humidity: Number,
  rainfall: Number,
  windSpeed: Number,
  weatherCondition: String,
  alerts: [weatherAlertSchema]
}, { timestamps: true });

const Weather = mongoose.model('Weather', weatherDataSchema);
export default Weather;

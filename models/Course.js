const mongoose = require('mongoose');
const Bootcamp = require('./Bootcamp');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Vui lòng nhập tiêu đề']
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập miêu tả']
  },
  weeks: {
    type: String,
    required: [true, 'Vui lòng nhập số tuần']
  },
  tuition: {
    type: String,
    required: [true, 'Vui lòng nhập học phí']
  },
  minimumSkill: {
    type: String,
    required: [true, 'Vui lòng nhập kỹ năng tối thiểu']
  },
  scholarshipAvailable : {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  }
});

module.exports = mongoose.model('Course', CourseSchema);
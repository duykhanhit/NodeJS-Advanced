const mongoose = require('mongoose');

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
    type: Number,
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
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

CourseSchema.statics.getAverageCost = async function(bootcampId){

  const obj = await this.aggregate([
    {
      $match: {bootcamp: bootcampId}
    },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: {$avg: '$tuition'}
      }
    }
  ]);

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10
    });
  } catch (err) {
    console.error(err);
  }
}

// Call getAverageCost after save
CourseSchema.post('save', async function(){
  await this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before remove
CourseSchema.pre('remove', async function(){
  await this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);
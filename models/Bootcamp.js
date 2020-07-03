const mongoose = require('mongoose');
const slugify = require('slugify');
const gocoder = require('../utils/geocoder');

const BootcampSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Chưa nhập tên'],
    unique: true,
    trim: true,
    maxlength: [50, 'Bạn đã nhập quá 50 ký tự']
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Bạn chưa nhập mô tả'],
    maxlength: [500, 'Bạn đã nhập quá 500 ký tự']
  },
  website: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Bạn chưa nhập địa chỉ website'
    ]
  },
  phone: {
    type: String,
    maxlength: [20, 'Bạn nhập sai định dạng số điện thoại']
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Bạn chưa nhập email'
    ]
  },
  address: {
    type: String,
    required: [true, 'Bạn chưa nhập địa chỉ']
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
    type: [Number],
    index: '2dsphere'
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String
  },
  careers: {
    // Array of strings
    type: [String],
    required: true,
    enum: [
      'Web Development',
      'Mobile Development',
      'UI/UX',
      'Data Science',
      'Business',
      'Other'
    ]
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating must can not be more than 10']
  },
  averageCost: Number,
  photo: {
    type: String,
    default: 'no-photo.jpg'
  },
  housing: {
    type: Boolean,
    default: false
  },
  jobAssistance: {
    type: Boolean,
    default: false
  },
  jobGuarantee: {
    type: Boolean,
    default: false
  },
  acceptGi: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
},
{
  toJSON: { virtuals: true},
  toObject: { virtuals: true }
});

// Create slug from name
BootcampSchema.pre('save', function(next){
  this.slug = slugify(this.name, {
    replacement: '-',
    lower: true
  });
  next();
});

//Geocoder & create location field
BootcampSchema.pre('save', async function(next){
  const loc = await gocoder.geocode(this.address);
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAdress: loc[0].formattedAddress,
    street: loc[0].streetName,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode
  }
  
  //Do not save address in DB
  this.address = undefined;
  next();
});

// Cascade delete courses when a bootcamp is deleted

BootcampSchema.pre('remove', async function(next) {
  await this.model('Course').deleteMany({ bootcamp: this._id});
  next();
})

// Reserve populate with virtuals
BootcampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false
});

module.exports = mongoose.model('Bootcamp', BootcampSchema);
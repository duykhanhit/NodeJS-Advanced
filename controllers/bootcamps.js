const path = require('path');
const Bootcamp = require('../models/Bootcamp');
const asyncHandle = require('../middlewares/async');
const geocoder = require('../utils/geocoder');
const ErrorResponse = require('../utils/errorResponse');

//@desc      GET all bootcamps
//@route     GET /api/v1/bootcamps
//@access    public

module.exports.getBootCamps = asyncHandle(async (req, res, next) => {
  let query;

  const reqQuery = { ...req.query };

  const removeFields = ['select', 'sort', 'page', 'limit'];
  
  removeFields.forEach(param => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(eq|gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

  if(req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    
    query = query.select(fields);
  }

  if(req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1)*limit;
  const endIndex = page*limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  const bootcamps = await query;

  const pagination = {};

  if(endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    }
  }

  if(startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    }
  }

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps
  });
});

//@desc      GET bootcamp
//@route     /api/v1/bootcamps/:id
//@access    public

module.exports.getBootCamp = asyncHandle(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`));
  }

  res.status(200).json({
    success: true,
    data: bootcamp
  });
});

//@desc       CREATE a new bootcamp
//@route      /api/v1/bootcamps
//@access     private

module.exports.createBootCamp = asyncHandle(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp
  });
});

//@desc      UPDATE a bootcamp
//@route     /api/v1/bootcamps/:id
//@access    private

module.exports.updateBootCamp = asyncHandle(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`));
  }

  res.status(200).json({
    success: true,
    data: bootcamp
  });
});

//@desc       Delete a bootcamps
//@route      /api/v1/bootcamps/:id
//@access     private

module.exports.deleteBootCamp = asyncHandle(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`));
  }

  bootcamp.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

//@desc       GET bootcamps by distance
//@route      /api/v1/bootcamps/radius/:zipcode/:distance
//@access     public

module.exports.getBootCampsInRadius = asyncHandle(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get latitude/Longitude from geocoder
  const loc =  await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lon = loc[0].longitude;

  // Tính bán kính
  const radius = distance/3396;

  // Get bootcaps from DB
  const bootcamps = await Bootcamp.find({ 
    location: {
      $geoWithin: { $centerSphere: [ [ lon, lat ], radius ] }
   }
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});

//@desc       Upload photo
//@route      PUT /api/v1/bootcamps/:id/photo
//@access     private

module.exports.bootcampPhotoUpload = asyncHandle(async (req, res, next) => {

  const bootcamp = await Bootcamp.findById(req.params.id);
  
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const { file } = req.files;

  if(!file.mimetype.startsWith('image')){
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  if(file.size > process.env.MAX_SIZE_UPLOAD){
    return next(new ErrorResponse(`Please upload a file with size less than ${process.env.MAX_SIZE_UPLOAD}`, 400));
  }

  file.name = `bootcamp_${req.params.id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FOLDER_DEFAULT}/${file.name}`, async err => {
    if(err){
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 400));
    }
  });
  
  await Bootcamp.findByIdAndUpdate(req.params.id, {
    photo: file.name
  });
  
  res.status(200).json({
    success: true,
    data: file.name
  });

});
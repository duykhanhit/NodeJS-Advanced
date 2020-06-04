const Bootcamp = require('../models/Bootcamp');
const asyncHandle = require('../middlewares/async');
const geocoder = require('../utils/geocoder');
const ErrorResponse = require('../utils/errorResponse');

//@desc   GET all bootcamps
//@route     GET /api/v1/bootcamps
//@access     public

module.exports.getBootCamps = asyncHandle(async (req, res, next) => {
  let query;

  let queryStr = JSON.stringify(req.query);
  queryStr = queryStr.replace(/\b(eq|gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  query = Bootcamp.find(JSON.parse(queryStr));
  
  const bootcamps = await query;

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});

//@desc   GET bootcamp
//@route     /api/v1/bootcamps/:id
//@access     public

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

//@desc   CREATE a new bootcamp
//@route     /api/v1/bootcamps
//@access     private

module.exports.createBootCamp = asyncHandle(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp
  });
});

//@desc   UPDATE a bootcamp
//@route     /api/v1/bootcamps/:id
//@access     private

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

//@desc     Delete a bootcamps
//@route     /api/v1/bootcamps/:id
//@access     public

module.exports.deleteBootCamp = asyncHandle(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`));
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

//@desc       GET bootcamps by distance
//@route     /api/v1/bootcamps/radius/:zipcode/:distance
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
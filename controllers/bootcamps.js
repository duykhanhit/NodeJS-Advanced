const path = require('path');
const Bootcamp = require('../models/Bootcamp');
const asyncHandle = require('../middlewares/async');
const geocoder = require('../utils/geocoder');
const ErrorResponse = require('../utils/errorResponse');

//@desc      GET all bootcamps
//@route     GET /api/v1/bootcamps
//@access    public

module.exports.getBootCamps = asyncHandle(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
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
    return next(new ErrorResponse(`Please upload a file with size less than ${process.env.MAX_SIZE_UPLOAD/(1024*1024)}MB`, 400));
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
const Bootcamp = require('../models/Bootcamp');


//@desc   GET all bootcamps
//@route     GET /api/v1/bootcamps
//@access     public

module.exports.getBootCamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find();

    res.status(200).json({
      success: true,
      count: bootcamps.length,
      data: bootcamps
    });
  } catch (error) {
    res.status(400).json({
      success: false
    });
  }
}

//@desc   GET bootcamp
//@route     /api/v1/bootcamps/:id
//@access     public

module.exports.getBootCamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp) {
      res.status(400).json({
        success: false
      });
    }

    res.status(200).json({
      success: true,
      data: bootcamp
    });
  } catch (error) {
    res.status(400).json({
      success: false
    });
  }
}

//@desc   CREATE a new bootcamp
//@route     /api/v1/bootcamps
//@access     private

module.exports.createBootCamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
      success: true,
      data: bootcamp
    });

  } catch (error) {

    res.status(400).json({
      success: false
    });

  }
}

//@desc   UPDATE a bootcamp
//@route     /api/v1/bootcamps/:id
//@access     private

module.exports.updateBootCamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if(!bootcamp) {
      res.status(400).json({
        success: false
      });
    }

    res.status(200).json({
      success: true,
      data: bootcamp
    });
  } catch (error) {
    res.status(400).json({
      success: false
    });
  }
}

//@desc   GET all bootcamps
//@route     /api/v1/bootcamps/:id
//@access     public

module.exports.deleteBootCamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if(!bootcamp) {
      res.status(400).json({
        success: false
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false
    });
  }
}
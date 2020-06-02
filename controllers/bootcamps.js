//@desc   GET all bootcamps
//url     /api/v1/bootcamps
//        public

module.exports.getBootCamps = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: 'Get all bootcamps'
  });
}

//@desc   GET bootcamp
//url     /api/v1/bootcamps/:id
//        public

module.exports.getBootCamp = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: `Get bootcapm with id:${req.params.id}`
  });
}

//@desc   CREATE a new bootcamp
//url     /api/v1/bootcamps
//        private

module.exports.createBootCamp = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: 'Create a new bootcamp'
  });
}

//@desc   UPDATE a bootcamp
//url     /api/v1/bootcamps/:id
//        private

module.exports.updateBootCamp = (req, res, next) => {
  res.status(200).json({
    success:true,
    msg: `Update a bootcamp with id:${req.params.id}`
  });
}

//@desc   GET all bootcamps
//url     /api/v1/bootcamps/:id
//        public

module.exports.deleteBootCamp = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: `Delete a bootcamp with id:${req.params.id}`
  })
}
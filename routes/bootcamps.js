const express = require('express');
const {
  getBootCamps,
  getBootCamp,
  createBootCamp,
  updateBootCamp,
  deleteBootCamp,
  getBootCampsInRadius,
  bootcampPhotoUpload
} = require('../controllers/bootcamps');

// Import other resource routers
const courseRouter = require('./courses');

const router = express.Router();

router.use('/:bootcampId/courses', courseRouter);

router.route('/:id/photo')
      .put(bootcampPhotoUpload);

router.route('/')
      .get(getBootCamps)
      .post(createBootCamp);

router.route('/:id')
      .get(getBootCamp)
      .put(updateBootCamp)
      .delete(deleteBootCamp);

router.route('/radius/:zipcode/:distance')
      .get(getBootCampsInRadius);


module.exports = router;
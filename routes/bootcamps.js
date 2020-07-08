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

const advancedResults = require('../middlewares/advancedResults');
const Bootcamp = require('../models/Bootcamp');
const { protect, authorize } = require('../middlewares/auth');

// Import other resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

const router = express.Router();

router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router.route('/:id/photo')
      .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

router.route('/')
      .get(advancedResults(Bootcamp, 'courses'), getBootCamps)
      .post(protect, authorize('publisher', 'admin'), createBootCamp);

router.route('/:id')
      .get(getBootCamp)
      .put(protect, authorize('publisher', 'admin'), updateBootCamp)
      .delete(protect, authorize('publisher', 'admin'), deleteBootCamp);

router.route('/radius/:zipcode/:distance')
      .get(getBootCampsInRadius);


module.exports = router;
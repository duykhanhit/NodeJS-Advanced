const Review = require('../models/Review');
const asyncHandle = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');

//@desc      GET all reviews
//@route     GET /api/v1/reviews
//@route     GET /api/v1/bootcamps/:bootcampId/reviews
//@access    public

module.exports.getReviews = asyncHandle( async (req, res, next) => {
  if(req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId});

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//@desc      GET single review
//@route     GET /api/v1/reviews/:id
//@access    public

module.exports.getReview = asyncHandle( async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  if(!review){
    return next(new ErrorResponse(`Cannot find review with id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

//@desc      Add a new review
//@route     POST /api/v1/bootcamps/:bootcampId/reviews
//@access    private

module.exports.addReview = asyncHandle( async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if(!bootcamp){
    return next(new ErrorResponse(`Cannot find bootcamp with id ${req.params.bootcampId}`, 404));
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review
  });
});

//@desc      Update a review
//@route     PUT /api/v1/reviews/:id
//@access    private

module.exports.updateReview = asyncHandle( async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if(!review) {
    return next( new ErrorResponse(`No review with id of ${req.params.id}`, 404));
  }

  if(review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a review id ${review._id}`, 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: review
  });
});

//@desc      Delete a review
//@route     PUT /api/v1/reviews/:id
//@access    private

module.exports.deleteReview = asyncHandle( async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if(!review) {
    return next( new ErrorResponse(`No review with id of ${req.params.id}`, 404));
  }

  if(review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a review id ${course._id}`, 401));
  }

  review.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
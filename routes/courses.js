const express = require('express');
const { getCourses, getCourse, addCourse } = require('../controllers/courses');

const router = express.Router({ mergeParams: true });

router.route('/')
      .get(getCourses)
      .post(addCourse);
router.route('/:courseId')
      .get(getCourse);

module.exports = router;
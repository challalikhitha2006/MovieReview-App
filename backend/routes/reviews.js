const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Get all reviews for a movie
router.get('/:movieId', async (req, res) => {
  console.log('Fetching reviews for:', req.params.movieId);
  try {
    const reviews = await Review.find({ movieId: req.params.movieId });
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: err.message });
  }
});

// Post a review for a movie
router.post('/', async (req, res) => {
  const { movieId, username, rating, comment } = req.body;
console.log('Received review:', req.body);
  if (!movieId || !username || !rating || !comment) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const review = new Review({
    movieId,
    username,
    rating,
    comment
  });

  try {
    const newReview = await review.save();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
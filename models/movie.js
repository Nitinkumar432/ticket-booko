const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  director: {
    type: String,
    required: true
  },
  cast: [
    {
      type: String,
      required: true
    }
  ],
  genre: [
    {
      type: String,
      required: true,
      enum: ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Animation', 'Documentary', 'Fantasy', 'Adventure','Biography']
    }
  ],
  releaseDate: {
    type: Date,
    required: true
  },
  runtime: {
    type: Number, // Runtime in minutes
    required: true
  },
  language: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  rating: {
    type: Number, // Rating from 0 to 10
    min: 0,
    max: 10,
    required: true
  },
  tags: [
    {
      type: String
    }
  ],
  posterUrl: {
    type: String
  },
  trailerUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  posted_by:{
    type:String,
    deafult:'Admin',
  }
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;

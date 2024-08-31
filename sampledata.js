const mongoose = require('mongoose');
const Movie = require('./models/movie'); // Adjust the path to where your Movie model is located
require('dotenv').config();
const uri = process.env.MONGO_URL;
// Connect to MongoDB
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const movies = [
    {
        title: 'Movie 1',
        description: 'A thrilling adventure.',
        director: 'Director 1',
        cast: ['Actor A', 'Actor B'],
        genre: ['Action', 'Adventure'],
        releaseDate: new Date('2024-01-01'),
        runtime: 120,
        language: 'English',
        country: 'USA',
        rating: 8.5,
        tags: ['thriller', 'adventure'],
        posterUrl: 'https://example.com/poster1.jpg',
        trailerUrl: 'https://example.com/trailer1.mp4'
    },
    {
        title: 'Movie 2',
        description: 'A heartwarming drama.',
        director: 'Director 2',
        cast: ['Actor C', 'Actor D'],
        genre: ['Drama', 'Romance'],
        releaseDate: new Date('2024-02-01'),
        runtime: 140,
        language: 'English',
        country: 'UK',
        rating: 7.8,
        tags: ['drama', 'romance'],
        posterUrl: 'https://example.com/poster2.jpg',
        trailerUrl: 'https://example.com/trailer2.mp4'
    },
    // Add 8 more movie objects here
    {
        title: 'Movie 3',
        description: 'An epic fantasy tale.',
        director: 'Director 3',
        cast: ['Actor E', 'Actor F'],
        genre: ['Fantasy', 'Adventure'],
        releaseDate: new Date('2024-03-01'),
        runtime: 160,
        language: 'English',
        country: 'USA',
        rating: 9.0,
        tags: ['fantasy', 'epic'],
        posterUrl: 'https://example.com/poster3.jpg',
        trailerUrl: 'https://example.com/trailer3.mp4'
    },
    {
        title: 'Movie 4',
        description: 'A hilarious comedy.',
        director: 'Director 4',
        cast: ['Actor G', 'Actor H'],
        genre: ['Comedy'],
        releaseDate: new Date('2024-04-01'),
        runtime: 110,
        language: 'English',
        country: 'USA',
        rating: 8.0,
        tags: ['comedy'],
        posterUrl: 'https://example.com/poster4.jpg',
        trailerUrl: 'https://example.com/trailer4.mp4'
    },
    {
        title: 'Movie 5',
        description: 'A spine-chilling horror film.',
        director: 'Director 5',
        cast: ['Actor I', 'Actor J'],
        genre: ['Horror'],
        releaseDate: new Date('2024-05-01'),
        runtime: 90,
        language: 'English',
        country: 'Canada',
        rating: 7.5,
        tags: ['horror'],
        posterUrl: 'https://example.com/poster5.jpg',
        trailerUrl: 'https://example.com/trailer5.mp4'
    },
    {
        title: 'Movie 6',
        description: 'A mind-bending sci-fi.',
        director: 'Director 6',
        cast: ['Actor K', 'Actor L'],
        genre: ['Sci-Fi'],
        releaseDate: new Date('2024-06-01'),
        runtime: 130,
        language: 'English',
        country: 'USA',
        rating: 8.7,
        tags: ['sci-fi'],
        posterUrl: 'https://example.com/poster6.jpg',
        trailerUrl: 'https://example.com/trailer6.mp4'
    },
    {
        title: 'Movie 7',
        description: 'A dramatic biopic.',
        director: 'Director 7',
        cast: ['Actor M', 'Actor N'],
        genre: ['Drama', 'Biography'],
        releaseDate: new Date('2024-07-01'),
        runtime: 150,
        language: 'English',
        country: 'UK',
        rating: 8.2,
        tags: ['drama', 'biography'],
        posterUrl: 'https://example.com/poster7.jpg',
        trailerUrl: 'https://example.com/trailer7.mp4'
    },
    {
        title: 'Movie 8',
        description: 'An action-packed thriller.',
        director: 'Director 8',
        cast: ['Actor O', 'Actor P'],
        genre: ['Action', 'Thriller'],
        releaseDate: new Date('2024-08-01'),
        runtime: 125,
        language: 'English',
        country: 'Australia',
        rating: 8.8,
        tags: ['action', 'thriller'],
        posterUrl: 'https://example.com/poster8.jpg',
        trailerUrl: 'https://example.com/trailer8.mp4'
    },
    {
        title: 'Movie 9',
        description: 'A touching romance story.',
        director: 'Director 9',
        cast: ['Actor Q', 'Actor R'],
        genre: ['Romance', 'Drama'],
        releaseDate: new Date('2024-09-01'),
        runtime: 115,
        language: 'English',
        country: 'USA',
        rating: 7.9,
        tags: ['romance', 'drama'],
        posterUrl: 'https://example.com/poster9.jpg',
        trailerUrl: 'https://example.com/trailer9.mp4'
    },
    {
        title: 'Movie 10',
        description: 'An exciting adventure film.',
        director: 'Director 10',
        cast: ['Actor S', 'Actor T'],
        genre: ['Adventure', 'Action'],
        releaseDate: new Date('2024-10-01'),
        runtime: 140,
        language: 'English',
        country: 'USA',
        rating: 9.1,
        tags: ['adventure', 'action'],
        posterUrl: 'https://example.com/poster10.jpg',
        trailerUrl: 'https://example.com/trailer10.mp4'
    }
];

const seedMovies = async () => {
    try {
        // Remove all existing movies

        // Add new movies
        await Movie.insertMany(movies);

        console.log('Movies added successfully!');
    } catch (error) {
        console.error('Error adding movies:', error);
    } finally {
        mongoose.connection.close();
    }
};

// Run the seed function
seedMovies();

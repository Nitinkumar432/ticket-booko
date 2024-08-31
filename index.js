const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const cookieParser = require('cookie-parser');
const Movie=require("./models/movie.js");
const app = express();
const Register = require('./models/register.js');
const SECRET_KEY = 'xyxxx'; // Replace with your actual secret key
const port = 80;
const uri = process.env.MONGO_URL;

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  const token = req.cookies.authToken; // Assuming token is stored in cookies

  if (!token) {
    return res.redirect('/login');
  }

  jwt.verify(token, SECRET_KEY, async (err, decoded) => {
    if (err) {
      return res.redirect('/login');
    }
    try {
      // Fetch the user data from the database
      const user = await Register.findById(decoded.id);
      if (!user) {
        return res.redirect('/login');
      }
      req.user = user; // Store the user data in the request object
      next();
    } catch (error) {
      console.error(error);
      return res.redirect('/login');
    }
  });
};

// Middleware to restrict access for logged-in users
const restrictAccess = (req, res, next) => {
  const token = req.cookies.authToken;

  if (token) {
    // Check if the token is valid
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (!err) {
        // Redirect to home if the token is valid
        return res.redirect('/home');
      }
    });
  }
  next();
};

// Route to the login page
app.get('/login', restrictAccess, (req, res) => {
  res.render('login');
});
app.get('/',verifyToken,(req,res)=>{
  console.log("home page accessed");
  res.render('home', { user: req.user });
})
// Home route
app.get('/home', verifyToken, (req, res) => {
  res.render('home', { user: req.user }); // Pass the user data to the home page
});
app.get('/explore-movie', verifyToken, async (req, res) => {
  try {
      // Fetch all movies
      const movies = await Movie.find({}).sort({ createdAt: -1 }); // Sort by newest first

      // Optionally, you can separate new events and other events
      const newEvents = movies.slice(0, 3); // Example: Top 3 new events
      const oldEvents = movies.slice(3); // Rest of the events

      res.render('explore.ejs', {
          user: req.user,
          newEvents: newEvents,
          events: oldEvents
      });
  } catch (err) {
      console.error('Error fetching movies:', err);
      res.status(500).send('Server error');
  }
});

app.get('/your-movies', verifyToken, async (req, res) => {
  // Check if the user is not an admin
  if (req.user.userType !== 'admin') {
    // Log an error message
    console.error("Unauthorized access attempt to 'your-movies' section");
    // Render an error page with a 401 status code
    return res.status(401).render('error', { message: "You are not authorized to view this page." });
  }

  try {
    console.log("Your movie section open");

    // Fetch movies posted by the user using their email
    const userMovies = await Movie.find({ posted_by: req.user.email });

    // Render the your_movie page with the user's movies
    res.render('your_movie', { user: req.user, movies: userMovies });
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).render('error', { message: "An error occurred while fetching movies." });
  }
});

// posting movie
app.get('/post-movie',verifyToken,(req,res)=>{

  res.render('movie',{ user: req.user });
})
// delete mvoie route
app.delete('/delete-movie/:id', async (req, res) => {
  try {
      const movieId = req.params.id;

      // Find and delete the movie
      const result = await Movie.findByIdAndDelete(movieId);

      if (result) {
          // Movie successfully deleted
          res.status(200).json({ message: 'Movie deleted successfully!' });
      } else {
          // Movie not found
          res.status(404).json({ message: 'Movie not found!' });
      }
  } catch (error) {
      console.error('Error deleting movie:', error);
      res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});
app.get('/logout',(req,res)=>{
  res.clearCookie('authToken');
  res.redirect('/login');
})
app.post('/post-movie', async (req, res) => {
  try {
    // Extract form data from req.body
    console.log(req.body);
    const movieData = req.body;

    // Create new movie document
    const movie = new Movie(movieData);

    // Save the movie to the database
    await movie.save();

    // Send success response with a popup
    res.send(`
      <script>
        alert('Movie saved successfully! Now you can check it on the home page.');
        window.location.href = '/';
      </script>
    `);
  } catch (error) {
    console.error('Error saving movie:', error);
    res.status(500).send('An error occurred while saving the movie.');
  }
});
// Handle login POST request
app.post('/login', restrictAccess, async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await Register.findOne({ email });

    if (!user || password !== user.password) {
      return res.render('login', { error: 'Email or password is incorrect.', errorClass: 'error' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });

    // Set the token in cookies
    res.cookie('authToken', token, { httpOnly: true });

    // Redirect to home page on successful login
    res.redirect('/home');
  } catch (error) {
    console.error(error);
    res.render('login', { error: 'Something went wrong. Please try again!', errorClass: 'error' });
  }
});

// Route to the register page
app.get('/register', restrictAccess, (req, res) => {
  
  res.render('register', { error: null });
});

// Handle register POST request
app.post('/register', restrictAccess, async (req, res) => {
  console.log(req.body);
  const { name, email, phoneNumber, dob, password, confirmPassword } = req.body;

  if (!name || !email || !phoneNumber || !dob || !password || !confirmPassword) {
    return res.render('register', { error: 'All fields are required!' });
  }

  if (password !== confirmPassword) {
    return res.render('register', { error: 'Passwords do not match!' });
  }

  if (password.length < 6) {
    return res.render('register', { error: 'Password must be at least 6 characters long!' });
  }

  try {
    const existingUser = await Register.findOne({
      $or: [{ email }, { phoneNumber }]
    });

    if (existingUser) {
      return res.render('register', { error: 'Email or Phone Number already in use!' });
    }

    const newUser = new Register({ name, email, phoneNumber, dob, password });
    await newUser.save();

    res.render('registersuccess');
  } catch (error) {
    console.error(error);
    res.render('register', { error: 'Something went wrong. Please try again!' });
  }
});

const fixedOTP = '204975'; // Fixed OTP for all users

// Route to verify OTP and update password
app.post('/check-email', async (req, res) => {
  console.log("check email accessd");
  const { email } = req.body;

  try {
    // Check if the email exists in the database
    const user = await Register.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Email not found!' });
    }
    // If email exists, send a success response
    res.status(200).json({ message: 'Email found!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong. Please try again!' });
  }
});

// Route to verify OTP and update password
app.post('/verify-otp', async (req, res) => {
  console.log("verify email accessd");
  const { email, newPassword } = req.body;

  // Update the user's password in the database
  try {
    await Register.updateOne({ email }, { password: newPassword });
    res.status(200).json({ message: 'Password updated successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong. Please try again!' });
  }
});

// Start server
app.listen(port, () => {
  console.log((`Listening on port https//localhost:${port}`));
});

const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();
const Coupon=require('./models/coupon.js');
const Putoken = require('./models/putcoupon'); // Correct way to import the Putoken model

const Help = require('./models/help.js');
const otpMap = new Map();
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');
const Movie=require("./models/movie.js");
const app = express();
const Register = require('./models/register.js');
const SECRET_KEY = 'xyxxx'; // Replace with your actual secret key
const port = 3000;
const uri = process.env.MONGO_URL;

const Booking = require('./models/ticketbook.js');
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
app.get('/',verifyToken,async (req,res)=>{
  console.log("home page accessed");
  const movies = await Movie.find({}).sort({ createdAt: -1 }); 
  const newEvents = movies.slice(0, 3);
  res.render('home', { user: req.user ,newEvents});
})
// Home route
app.get('/home', verifyToken, async (req, res) => {
  const movies = await Movie.find({}).sort({ createdAt: -1 }); 
  const newEvents = movies.slice(0, 3);
  res.render('home', { user: req.user,newEvents }); // Pass the user data to the home page
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
app.post('/post-movie', verifyToken, async (req, res) => {
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



// Route to verify OTP and update password


// Route to verify OTP and update password

// booking movie logic
// routes/movie.js
// Assuming you have the Express setup and `Register` or `Movie` model imported

app.get('/book-movie/:id', verifyToken,async (req, res) => {
  try {
      // Use await to wait for the result from the database
      const event = await Movie.findById(req.params.id);

      if (!event) {
          return res.status(404).send('Movie not found');
      }

      // Render the booking page with the movie data
      res.render('book-movie', { event,user:req.user });
  } catch (err) {
      // Handle errors
      console.error(err);
      res.status(500).send('Server Error');
  }
});



// otp verification system
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.EMAIL_USER,  // Email address stored in .env
      pass: process.env.EMAIL_PASS   // Email password stored in .env
  }
});
// updating route:

// Route to verify OTP and update password
app.post('/check-email', async (req, res) => {
  console.log("check accessed");
  const { email } = req.body;

  try {
      const user = await Register.findOne({ email: email });
      if (!user) {
          return res.status(400).json({ error: 'Email not found!' });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = Date.now() + 5 * 60 * 1000;

      otpMap.set(email, { otp, otpExpiry });

      const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Your OTP for Password Reset',
          text: `Your OTP for password reset is: ${otp}. This OTP is valid for 5 minutes.`,
          html: `<p>Your OTP for password reset is: <strong>${otp}</strong>.</p><p>This OTP is valid for 5 minutes.</p>`
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'OTP sent to your email!' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong. Please try again!' });
  }
});

app.post('/verify-otp', async (req, res) => {
  console.log("verify email accessed");
  const { email, otp, newPassword } = req.body;
  console.log(req.body);

  const storedOtpInfo = otpMap.get(email);
  if (!storedOtpInfo || storedOtpInfo.otp !== otp || Date.now() > storedOtpInfo.otpExpiry) {
      return res.status(400).json({ error: 'Invalid or expired OTP!' });
  }

  try {
      await Register.updateOne({ email: email }, { password: newPassword });
      console.log("Password updated successfully.");
      otpMap.delete(email); 
      res.status(200).json({ message: 'Password updated successfully!' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong. Please try again!' });
  }
});
// store ticker in db
// In your server-side route handler for booking
app.post('/book-movie/:movieId', verifyToken, async (req, res) => {
  const user = req.user;

  // Extract booking details from the request body
  const { movieName, seatType, seats, totalPrice, paymentMethod, slot, timing, location, userEmail, dateOfBooking } = req.body;

  try {
    // Save booking in the database
    const booking = new Booking({
      movieName,
      seatType,
      seats,
      totalPrice,
      paymentMethod,
      slot,
      timing,
      location,
      userEmail,
      dateOfBooking,
    });

    await booking.save();  // Save booking

    // Prepare the HTML email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <div style="background-color: #4CAF50; padding: 20px; text-align: center; color: white; font-size: 20px; font-weight: bold;">
            Movie Booking Confirmation
          </div>
          <div style="padding: 20px;">
            <p style="font-size: 16px;">Hello, <strong>${userEmail}</strong></p>
            <p style="font-size: 16px;">Your booking for <strong>${movieName}</strong> has been successfully confirmed!</p>
            
            <div style="margin-top: 20px; padding: 10px; background-color: #f1f1f1; border-radius: 8px;">
              <h4 style="color: #4CAF50;">Booking Details:</h4>
              <p><strong>Movie Name:</strong> ${movieName}</p>
              <p><strong>Seat Type:</strong> ${seatType}</p>
              <p><strong>Seats:</strong> ${seats.join(", ")}</p>
              <p><strong>Total Price:</strong> ₹${totalPrice}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
              <p><strong>Slot:</strong> ${slot}</p>
              <p><strong>Timing:</strong> ${timing}</p>
              <p><strong>Location:</strong> ${location}</p>
              <p><strong>Date of Booking:</strong> ${dateOfBooking}</p>
            </div>

            <div style="margin-top: 20px; text-align: center;">
              <a href="#" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; transition: background-color 0.3s ease;">
                View Your Booking
              </a>
            </div>
          </div>
          <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #555;">
            Thank you for booking with us! Enjoy the movie!
          </div>
        </div>
      </div>
    `;

    // Send the email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,   // Sender's email
      to: userEmail,                  // Receiver's email (user email from booking)
      subject: `Booking Confirmation for ${movieName}`,  // Subject of the email
      html: htmlContent               // The HTML content you created
    });

    res.json({ success: true, message: 'Booking confirmed and email sent.' });

  } catch (error) {
    console.error('Booking error:', error);
    res.json({ success: false, error: 'Booking failed or email could not be sent.' });
  }
});
app.get('/booking-success',(req,res)=>{
  res.render("booking-success");

});

// shpow all booke moview
app.get('/booked_movie', verifyToken, async (req, res) => {
  const usermail = req.user.email;
  const allBookedMovie = await Booking.find({ userEmail: usermail });
  
  res.render("booked_movie", { allBookedMovie });
});
// download moview data as pdf
const PDFDocument = require('pdfkit');
const fs = require('fs');

app.get('/download_ticket/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).send('Ticket not found');
        }

        const doc = new PDFDocument();
        const filename = `Ticket_${booking.movieName.replace(/\s+/g, '_')}.pdf`;
        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res); // Pipe PDF to response

        // Add content to the PDF
        doc.fontSize(25).text(`Movie: ${booking.movieName}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Seat Type: ${booking.seatType}`);
        doc.text(`Seats: ${booking.seats.join(', ')}`);
        doc.text(`Total Price: $${booking.totalPrice.toFixed(2)}`);
        doc.text(`Payment Method: ${booking.paymentMethod}`);
        doc.text(`Slot: ${booking.slot}`);
        doc.text(`Timing: ${booking.timing}`);
        doc.text(`Location: ${booking.location}`);
        doc.text(`Date of Booking: ${booking.dateOfBooking}`);
        doc.text(`User Email: ${booking.userEmail}`);
        
        doc.end(); // Finalize the PDF and end the stream
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating ticket');
    }
});
// help query
app.get('/help-query', async (req, res) => {
  try {
    const pendingQueries = await Help.find({ query_resolved: 'No' });
    const resolvedQueries = await Help.find({ query_resolved: 'Yes' });
    res.render('help_query', { pendingQueries, resolvedQueries });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Route to resolve a query
app.post('/help-query/resolve/:id', async (req, res) => {
  const { resolved_message } = req.body;
  try {
    const updatedQuery = await Help.findByIdAndUpdate(req.params.id, {
      query_resolved: 'Yes',
      resolved_message,
    }, { new: true }); // Return the updated document

    res.json({ success: true, resolvedMessage: updatedQuery.resolved_message }); // Send the resolved message as JSON response
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' }); // Send error as JSON response
  }
});
app.get('/help', verifyToken, async (req, res) => {
  try {
    // Find queries related to the logged-in user
    const userEmail = req.user.email; // Assuming req.user contains the logged-in user's info
    const pendingQueries = await Help.find({ email: userEmail, query_resolved: 'No' });
    const resolvedQueries = await Help.find({ email: userEmail, query_resolved: 'Yes' });

    res.render('help.ejs', {
      pendingQueries,
      resolvedQueries,
      message: null,
      user: req.user
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});
app.post('/submit-query', verifyToken, async (req, res) => {
  const { name, email, query } = req.body;

  try {
      // Create a new query document
      const newQuery = new Help({ name, email, query });
      // Save the document to the database
      await newQuery.save();
      console.log('Query saved to the database');

      // Render the help page with a success message
      res.send(`<html>
                <head>
                    <title>Success</title>
                    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
                    <style>
                        body {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            background-color: #f8f9fa;
                        }
                        .success-message {
                            background-color: #fff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <div class="success-message">
                        <h2>Your query has been submitted successfully!</h2>
                        <p>You will be redirected in a moment...</p>
                    </div>
                    <script>
                        setTimeout(function() {
                            window.location.href = '/help'; // Redirect to the help query page
                        }, 2000); // 2 seconds delay
                    </script>
                </body>
            </html>
        `);
      // res.render('help', { message: 'Query submitted successfully. We\'ll get back to you on this!', user: req.user });
  } catch (error) {
      console.error('Error saving query:', error);
      // Render the help page with an error message
      // r
      res.send("there is problem to sending your quer");
  }
});


// offfer section
app.get("/offer", verifyToken, async (req, res) => {
  try {
    const coupons = await Coupon.find({ email: req.user.email });
    const putokens = await Putoken.find({ isscratched: false }); // Only get unscratched tokens
    
    // Render the "offer" template and pass the coupons to it
    return res.render("offer", { user: req.user, coupons, putokens });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching coupons', error });
  }
});
app.post('/scratch-coupon/:id', verifyToken, async (req, res) => {
  try {
    const couponId = req.params.id;

    // Find the coupon and mark it as scratched
    const coupon = await Putoken.findByIdAndUpdate(couponId, { isscratched: true }, { new: true });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    return res.status(200).json({ 
      message: 'Coupon scratched successfully', 
      coupon: {
        discount: coupon.discount,
        validTill: coupon.validTill,
        email: req.user.email // Assuming you have user data from the token
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error scratching coupon', error });
  }
});



// Route to store the coupon
app.post('/api/store-coupon', async (req, res) => {
  const { coupons, email } = req.body;

  try {
      // Assuming you have a Coupon model
      const couponPromises = coupons.map(coupon => {
          return Coupon.create({ ...coupon, email });
      });

      await Promise.all(couponPromises);

      res.status(200).json({ message: 'Coupons stored successfully!' });
  } catch (error) {
      console.error('Error storing coupons:', error);
      res.status(500).json({ message: 'Error storing coupons.' });
  }
});

// Route to get user coupons
// app.get('/api/coupons', verifyToken, async (req, res) => {
//   try {
//       const coupons = await Coupon.find({ email: req.user.email });
//       return res.status(200).json(coupons);
//   } catch (error) {
//       return res.status(500).json({ message: 'Error fetching coupons', error });
//   }
// });


// admoin add coupon
app.get('/put-coupon', verifyToken, (req, res) => {
  res.render('put-coupon', { user: req.user });
});

// Handle Coupon Submission
app.post('/put-coupon', verifyToken, async (req, res) => {
  const { discount, validTill } = req.body;
  console.log(req.body);

  try {
      // Create a new Putoken instance
      const coupon = new Putoken({
          discount,
          validTill,
          createdBy: req.user._id, // Getting the ID of the admin
      });

      // Save the coupon to the database
      await coupon.save();

      // Sending success response
      res.status(201).json({ message: 'Coupon created successfully!' });
  } catch (error) {
      console.error('Error creating coupon:', error);
      res.status(500).json({ message: 'Error creating coupon.' });
  }
});


// stram moview
const movies = {
  currentlyShowing: [
    { id: 1, title: "Pathaan", releaseDate: "2023-01-25", rating: "8.5", genre: "Action, Thriller", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzoC-6UUYraKkzLSZYTQmHCwiUDlZmesoQJw&s" },
    { id: 2, title: "Jawan", releaseDate: "2023-09-07", rating: "7.8", genre: "Action, Thriller", image: "https://m.media-amazon.com/images/I/71tQNSjxAQL._AC_UF1000,1000_QL80_.jpg" },
    { id: 3, title: "Tiger 3", releaseDate: "2023-11-10", genre: "Action, Thriller", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxLpqz96l7ptYXKNvea-MBN_KLTXL-3mEg5A&s" },
    { id: 4, title: "Dunki", releaseDate: "2023-12-22", genre: "Comedy, Drama", image: "https://m.media-amazon.com/images/I/91zOCNs+x-L.jpg" },
    // Add more movies here
  ],
  upcoming: [
    { id: 3, title: "Tiger 3", releaseDate: "2023-11-10", genre: "Action, Thriller", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxLpqz96l7ptYXKNvea-MBN_KLTXL-3mEg5A&s" },
    { id: 4, title: "Dunki", releaseDate: "2023-12-22", genre: "Comedy, Drama", image: "https://m.media-amazon.com/images/I/91zOCNs+x-L.jpg" },
    // Add more upcoming movies here
  ],
  comingSoon: [
    { id: 5, title: "Bholaa", releaseDate: "2024-03-30", genre: "Action, Thriller", image: "https://hindi.dynamitenews.com/images/2023/01/22/ajay-devgan-shared-the-poster-of-the-film-bhola/iNx7cjN8de3YY6qmuDVMUAwH0FnUAtTbls8JOuaU.jpg" },
    { id: 6, title: "Adipurush", releaseDate: "2023-06-16", genre: "Action, Adventure", image: "https://static.theprint.in/wp-content/uploads/2022/10/ANI-20221023042911.jpg" },
    { id: 3, title: "Tiger 3", releaseDate: "2023-11-10", genre: "Action, Thriller", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxLpqz96l7ptYXKNvea-MBN_KLTXL-3mEg5A&s" },
    { id: 4, title: "Dunki", releaseDate: "2023-12-22", genre: "Comedy, Drama", image: "https://m.media-amazon.com/images/I/91zOCNs+x-L.jpg" },
    // Add more coming soon movies here
  ]
};
app.get('/stream', (req, res) => {
  res.render('stream', { movies });
});
// Start server
app.listen(port, () => {
  console.log((`Listening on port https//localhost:${port}`));
});

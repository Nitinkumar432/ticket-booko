const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  movieName: {
    type: String, // Name of the movie
    required: true
  },
  seatType: {
    type: String, // Type of seat (e.g., VIP, Regular)
    required: true
  },
  seats: {
    type: [String], // Array of seat numbers
    required: true
  },
  totalPrice: {
    type: Number, // Total price of the booking
    required: true
  },
  paymentMethod: {
    type: String, // Payment method used (e.g., Credit Card, PayPal)
    required: true
  },
  slot: {
    type: String, // Slot information (e.g., Morning, Evening)
   
  },
  timing: {
    type: String, // Timing of the movie
   
  },
  location: {
    type: String, // Location of the theater
    
  },
  userEmail: {
    type: String, // Email of the user making the booking
    required: true
  },
  dateOfBooking: {
    type: String, // Date when the booking was made
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the User who made the booking
    ref: 'User',
    required: false // Optional, if you don't have userId initially but plan to add it later
  }
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;

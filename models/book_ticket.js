const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event', // Assuming you have an Event model
        required: true,
    },
    ticketQuantity: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    bookingDate: {
        type: Date,
        required: true,
    },
    timeSlot: {
        type: String,
        required: true,
    },
    seatType: {
        type: String,
        required: true,
    },
    seats: {
        type: [Number], // Array of selected seat numbers
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;

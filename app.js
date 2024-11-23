const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const favicon = require('serve-favicon');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard'); 
const adminRoutes = require('./routes/adminRoutes'); 
const eventReq = require('./routes/eventReq'); 
const userOperations=require('./routes/userOp');
const eventRoutes=require('./routes/event');
const attendanceRoutes=require('./routes/attendance');
const userRoutes = require('./routes/user');
const Event = require('./models/Event');
const chatbotRoute = require("./routes/chatbot");
const pdfPrintRoute = require("./routes/pdfPrint");
require('dotenv').config();

const app = express();

// Trust proxy
app.set('trust proxy', true);


app.set('views', path.join(__dirname, 'views'));



// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your_db_name')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Set EJS as the template engine
app.set('view engine', 'ejs');



app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));

// Body parser middleware
// app.use(express.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// Express session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secure_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables for flash messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 }).limit(3); // Sort by newest and limit to 3 events
    res.render('index', { events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.render('index', { events: [] }); // Render with empty events if there's an error
  }
});



// Auth routes

app.use('/user', userRoutes);
app.use("/api/chatbot", chatbotRoute);
app.use('/auth', authRoutes);
app.use('/', dashboardRoutes);
app.use('/admin', adminRoutes); 
app.use(eventReq); 
app.use(userOperations);
app.use(eventRoutes);
app.use(attendanceRoutes);
app.use(pdfPrintRoute);



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

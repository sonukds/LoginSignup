const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const session = require('express-session');
const User = require('./models/user');

const app = express();

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'mysecretkey', // Replace with a real secret key in production
  resave: false,
  saveUninitialized: true,
}));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/authDB')
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

// Routes
app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/', (req, res) => {
  if (req.session.userId) {
    res.render('home');
  } else {
    res.redirect('/login');
  }
});

app.post('/signup', async (req, res) => {
  const { name, email, password, confirmPassword, mobile } = req.body;
  if (password !== confirmPassword) {
    return res.send('Passwords do not match');
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobile
    });
    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    console.log(err);
    res.send('Error during signup');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.send('User not found');
  }
  
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.send('Incorrect password');
  }

  req.session.userId = user._id;
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send('Error logging out');
    }
    res.redirect('/login');
  });
});

// Add this to your existing app.js

// Route to handle form submission
app.post('/send-message', (req, res) => {
  const { name, email, subject, message } = req.body;
  // Process the message, e.g., save it to a database or send an email
  console.log(`Message received from ${name} (${email}): ${subject} - ${message}`);
  
  // Respond to the user
  res.send('Thank you for reaching out! We will get back to you soon.');
});


app.listen(9000, () => {
  console.log('Server running on port 9000');
});

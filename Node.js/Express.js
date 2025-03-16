// File: backend/server.js
// Dependencies: express, mongoose, bcrypt, jsonwebtoken, cors

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// ** 1. Database Connection **
mongoose.connect('YOUR_MONGODB_URI', {  // Replace with your MongoDB URI
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// ** 2. User Model **
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true},
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  progress: { type: Object, default: {} },  // Store user's course/lesson progress
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema);

// ** 3. Course Model **
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }], // Array of Lesson IDs
  level: {type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner'}
});

const Course = mongoose.model('Course', courseSchema);

// ** 4. Lesson Model **
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String }, // Store lesson content (text, HTML, etc.)
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, // Reference to the Course it belongs to
  type: {type: String, enum: ['text', 'video', 'quiz'], default: 'text'}
});

const Lesson = mongoose.model('Lesson', lessonSchema);

// ** 5. Authentication Routes **

// Register a new user
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const user = new User({ username, password, email });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, 'YOUR_JWT_SECRET', {  // Replace with a strong secret
      expiresIn: '1h' // Token expires in 1 hour
    });

    res.json({ message: 'Login successful', token, userId: user._id, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// ** 6. Middleware: Authenticate JWT **
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, 'YOUR_JWT_SECRET', (err, user) => { // Replace with your secret
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.user = user; // Attach user info to the request
    next();
  });
};

// ** 7. Course Routes **

// Get all courses (accessible to all authenticated users)
app.get('/api/courses', authenticateToken, async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
});

// Get a specific course by ID
app.get('/api/courses/:id', authenticateToken, async (req, res) => {
    try {
      const course = await Course.findById(req.params.id).populate('lessons'); // Populate the 'lessons' field
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      res.json(course);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch course' });
    }
  });

// Create a new course (admin only)
app.post('/api/courses', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const { title, description, level } = req.body; // Added level
    const course = new Course({ title, description, level });
    await course.save();
    res.status(201).json({ message: 'Course created successfully', course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create course' });
  }
});

// ** 8. Lesson Routes **

//Get a specific lesson
app.get('/api/lessons/:id', authenticateToken, async (req, res) => {
  try{
    const lesson = await Lesson.findById(req.params.id);
    if(!lesson){
      return res.status(404).json({message: 'lesson not found'});
    }
    res.json(lesson);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch lesson' });
  }
})

// Create a new lesson (admin only)
app.post('/api/lessons', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const { title, content, course, type } = req.body;
    const lesson = new Lesson({ title, content, course, type });

    // Save the lesson
    await lesson.save();

    // Update the course to include the lesson (assuming 'course' is the course ID)
    await Course.findByIdAndUpdate(course, { $push: { lessons: lesson._id } });

    res.status(201).json({ message: 'Lesson created successfully', lesson });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create lesson' });
  }
});

// ** 9. User Progress Route **
app.put('/api/users/:userId/progress', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const { courseId, lessonId, completed } = req.body;

  if (req.user.userId !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update progress.  Example:  { "course1": { "lesson1": true, "lesson2": false } }
    user.progress[courseId] = user.progress[courseId] || {};
    user.progress[courseId][lessonId] = completed;
    await user.save();

    res.json({ message: 'Progress updated successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update progress' });
  }
});
//**10. Delete Course route**
app.delete('/api/courses/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  try{
    const course = await Course.findByIdAndDelete(req.params.id);
    if(!course){
      return res.status(404).json({message: 'Course not found'});
    }
    res.json({message: 'course deleted successfully'});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete course' });
  }
});

//**11. Update Course Route**
app.put('/api/courses/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  try{
    const {title, description, level} = req.body;
    const course = await Course.findByIdAndUpdate(req.params.id, {title, description, level}, {new: true});
    if(!course){
      return res.status(404).json({message: 'course not found'});
    }
    res.json({message: 'Course updated successfully', course});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update course' });
  }
});

//**12. Update Lesson Route**
app.put('/api/lessons/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  try{
    const {title, content, course, type} = req.body;
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, {title, content, course, type}, {new: true});
    if(!lesson){
      return res.status(404).json({message: 'Lesson not found'});
    }
    res.json({message: 'Lesson updated successfully', lesson});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update Lesson' });
  }
});

//**13. Delete Lesson Route**
app.delete('/api/lessons/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  try{
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if(!lesson){
      return res.status(404).json({message: 'Lesson not found'});
    }
    res.json({message: 'Lesson deleted successfully'});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete lesson' });
  }
});

// ** 14. Start Server **
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

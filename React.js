// File: frontend/src/App.js
// Dependencies: react, react-router-dom, axios, styled-components

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled, { ThemeProvider } from 'styled-components';

// ** 1. Theme (Dark Theme) **
const darkTheme = {
  colors: {
    background: '#121212',
    text: '#FFFFFF',
    primary: '#BB86FC',
    secondary: '#3700B3',
    accent: '#03DAC6',
    error: '#CF6679' // Error color
  },
  fontSizes: {
    small: '14px',
    medium: '16px',
    large: '20px',
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
  }
};

const lightTheme = {
  colors: {
    background: '#FFFFFF',
    text: '#000000',
    primary: '#6200EE',
    secondary: '#3700B3',
    accent: '#03DAC6',
    error: '#B00020'
  },
  fontSizes: {
    small: '14px',
    medium: '16px',
    large: '20px',
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
  }
};

// ** 2. Styled Components (Basic Examples) **

const AppContainer = styled.div`
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  min-height: 100vh;
  font-family: sans-serif;
  padding: ${props => props.theme.spacing.medium};
`;

const Header = styled.header`
  background-color: ${props => props.theme.colors.secondary};
  color: ${props => props.theme.colors.text};
  padding: ${props => props.theme.spacing.medium};
  margin-bottom: ${props => props.theme.spacing.large};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Nav = styled.nav`
    display: flex;
    gap: ${props => props.theme.spacing.medium};
`;

const Button = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSizes.medium};
  padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.medium};
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing.small};
  border: 1px solid ${props => props.theme.colors.accent};
  border-radius: 5px;
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  margin-top: ${props => props.theme.spacing.small};
`;

const CourseListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.large};
`;

const CourseCard = styled.div`
  background-color: #333; // Darker card background
  border-radius: 8px;
  padding: ${props => props.theme.spacing.medium};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
  }
`;

const CourseTitle = styled.h2`
  font-size: ${props => props.theme.fontSizes.large};
  margin-bottom: ${props => props.theme.spacing.small};
`;

const CourseDescription = styled.p`
  font-size: ${props => props.theme.fontSizes.medium};
  color: #ddd; // Light grey description text
`;
const StyledLink = styled(Link)`
  color: ${props => props.theme.colors.accent};
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

// ** 3. Components **

// Login Component
function Login({ setToken, setUserId, setRole }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', { // Adjust URL if needed
        username: username,
        password: password
      });

      if (response.status === 200) {
        setToken(response.data.token);
        setUserId(response.data.userId);
        setRole(response.data.role);

        // Store token in local storage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('role', response.data.role);

        navigate('/courses'); // Redirect to the courses page
      } else {
        setError('Login failed');
      }
    } catch (error) {
      setError('Invalid username or password');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <br />
        <label>
          Password:
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <br />
        <Button type="submit">Login</Button>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </form>
    </div>
  );
}

// Register Component
function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/register', {
                username: username,
                password: password,
                email: email
            });

            if (response.status === 201) {
                // Registration successful, redirect to login page
                navigate('/login');
            } else {
                setError('Registration failed');
            }
        } catch (error) {
            setError('Username or email already exists');
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Username:
                    <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                </label>
                <br />
                <label>
                    Password:
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                <br />
                <label>
                    Email:
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <br />
                <Button type="submit">Register</Button>
                {error && <ErrorMessage>{error}</ErrorMessage>}
            </form>
        </div>
    );
}

// Course List Component
function CourseList({ token, userId }) {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/courses', { // Adjust URL if needed
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(response.data);
      } catch (error) {
        setError('Failed to fetch courses');
      }
    };

    fetchCourses();
  }, [token]);

  return (
    <div>
      <h2>Available Courses</h2>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <CourseListContainer>
        {courses.map(course => (
          <CourseCard key={course._id}>
            <CourseTitle>{course.title}</CourseTitle>
            <CourseDescription>{course.description}</CourseDescription>
            <StyledLink to={`/courses/${course._id}`}>View Course</StyledLink>
          </CourseCard>
        ))}
      </CourseListContainer>
    </div>
  );
}

// Course Detail Component
function CourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourse(response.data);
      } catch (error) {
        setError('Failed to fetch course details');
        console.error("Error fetching course:", error);
        navigate('/courses'); // Redirect if course not found
      }
    };

    fetchCourse();
  }, [courseId, token, navigate]);

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (!course) {
    return <div>Loading course details...</div>;
  }

  return (
    <div>
      <h2>{course.title}</h2>
      <p>{course.description}</p>

      <h3>Lessons</h3>
      {course.lessons && course.lessons.length > 0 ? (
        <ul>
          {course.lessons.map(lesson => (
            <li key={lesson._id}>
              <StyledLink to={`/lessons/${lesson._id}`}>{lesson.title}</StyledLink>
            </li>
          ))}
        </ul>
      ) : (
        <p>No lessons available for this course.</p>
      )}
    </div>
  );
}

// Lesson Component
function LessonComponent() {
    const { lessonId } = useParams();
    const [lesson, setLesson] = useState(null);
    const [error, setError] = useState('');
    const [token] = useState(localStorage.getItem('token') || '');

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/lessons/${lessonId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLesson(response.data);
            } catch (error) {
                setError('Failed to fetch lesson');
                console.error("Error fetching lesson:", error);
            }
        };

        fetchLesson();
    }, [lessonId, token]);

    if (error) {
        return <ErrorMessage>{error}</ErrorMessage>;
    }

    if (!lesson) {
        return <div>Loading lesson...</div>;
    }

    return (
        <div>
            <h2>{lesson.title}</h2>
            <p>{lesson.content}</p>
        </div>
    );
}

// Admin Dashboard Component
function AdminDashboard({ token, role }) {
  const [courses, setCourses] = useState([]);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [newCourseLevel, setNewCourseLevel] = useState('beginner'); // Default to beginner
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [newLessonCourse, setNewLessonCourse] = useState('');
  const [newLessonType, setNewLessonType] = useState('text');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editedCourseTitle, setEditedCourseTitle] = useState('');
  const [editedCourseDescription, setEditedCourseDescription] = useState('');
  const [editedCourseLevel, setEditedCourseLevel] = useState('beginner');
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editedLessonTitle, setEditedLessonTitle] = useState('');
  const [editedLessonContent, setEditedLessonContent] = useState('');
  const [editedLessonType, setEditedLessonType] = useState('text');
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState('');


  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true); // Start loading
      try {
        const response = await axios.get('http://localhost:5000/api/courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(response.data);
        setError('');
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError('Failed to fetch courses');
      } finally {
        setCoursesLoading(false); // End loading, whether success or failure
      }
    };

    if (token && role === 'admin') {
      fetchCourses();
    }
  }, [token, role]);

  const handleCreateCourse = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/courses', {
        title: newCourseTitle,
        description: newCourseDescription,
        level: newCourseLevel
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses([...courses, response.data.course]); // Add the new course to the state
      setNewCourseTitle('');
      setNewCourseDescription('');
      setNewCourseLevel('beginner');
      setMessage('Course created successfully!');
      setError('');
    } catch (error) {
      console.error("Error creating course:", error);
      setError('Failed to create course');
      setMessage('');
    }
  };

  const handleCreateLesson = async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/lessons', {
            title: newLessonTitle,
            content: newLessonContent,
            course: newLessonCourse,
            type: newLessonType
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Update the courses state to include the new lesson
        setCourses(prevCourses =>
            prevCourses.map(course =>
                course._id === newLessonCourse
                    ? { ...course, lessons: [...(course.lessons || []), response.data.lesson._id] }
                    : course
            )
        );
        setNewLessonTitle('');
        setNewLessonContent('');
        setNewLessonCourse('');
        setNewLessonType('text');
        setMessage('Lesson created successfully!');
        setError('');
    } catch (error) {
        console.error("Error creating lesson:", error);
        setError('Failed to create lesson');
        setMessage('');
    }
};

  const handleDeleteCourse = async (courseId) => {
    try {
      await axios.delete(`http://localhost:5000/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCourses(courses.filter(course => course._id !== courseId));
      setMessage('Course deleted successfully!');
      setError('');
    } catch (error) {
      console.error("Error deleting course:", error);
      setError('Failed to delete course');
      setMessage('');
    }
  };

  const handleStartEditCourse = (course) => {
    setEditingCourseId(course._id);
    setEditedCourseTitle(course.title);
    setEditedCourseDescription(course.description);
    setEditedCourseLevel(course.level);
  };

  const handleCancelEditCourse = () => {
    setEditingCourseId(null);
  };

  const handleUpdateCourse = async () => {
    try {
      await axios.put(`http://localhost:5000/api/courses/${editingCourseId}`, {
        title: editedCourseTitle,
        description: editedCourseDescription,
        level: editedCourseLevel
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCourses(courses.map(course =>
        course._id === editingCourseId
          ? { ...course, title: editedCourseTitle, description: editedCourseDescription, level: editedCourseLevel }
          : course
      ));
      setEditingCourseId(null);
      setMessage('Course updated successfully!');
      setError('');
    } catch (error) {
      console.error("Error updating course:", error);
      setError('Failed to update course');
      setMessage('');
    }
  };

    const handleStartEditLesson = (lesson) => {
        setEditingLessonId(lesson._id);
        setEditedLessonTitle(lesson.title);
        setEditedLessonContent(lesson.content);
        setEditedLessonType(lesson.type);
    };

    const handleCancelEditLesson = () => {
        setEditingLessonId(null);
    };

    const handleUpdateLesson = async () => {
        try {
            await axios.put(`http://localhost:5000/api/lessons/${editingLessonId}`, {
                title: editedLessonTitle,
                content: editedLessonContent,
                type: editedLessonType
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCourses(prevCourses =>
                prevCourses.map(course => ({
                    ...course,
                    lessons: course.lessons.map(lessonId => {
                        if (lessonId === editingLessonId) {
                            return {
                                _id: lessonId,
                                title: editedLessonTitle,
                                content: editedLessonContent,
                                type: editedLessonType
                            };
                        }
                        return lessonId;
                    })
                }))
            );
            setEditingLessonId(null);
            setMessage('Lesson updated successfully!');
            setError('');
        } catch (error) {
            console.error("Error updating lesson:", error);
            setError('Failed to update lesson');
            setMessage('');
        }
    };
    const handleDeleteLesson = async (lessonId) => {
      try {
        await axios.delete(`http://localhost:5000/api/lessons/${lessonId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Update the courses state to remove the lesson ID from the lessons array
        setCourses(prevCourses =>
          prevCourses.map(course => ({
            ...course,
            lessons: course.lessons.filter(id => id !== lessonId)
          }))
        );
        setMessage('Lesson deleted successfully!');
        setError('');
      } catch (error) {
        console.error("Error deleting lesson:", error);
        setError('Failed to delete lesson');
        setMessage('');
      }
    };

  if (role !== 'admin') {
    return <

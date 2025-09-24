const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key';

app.use(bodyParser.json());

// Sample data
let books = [
    {
        isbn: "9780140449136",
        title: "Crime and Punishment",
        author: "Fyodor Dostoevsky",
        reviews: []
    },
    {
        isbn: "9780061120084",
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        reviews: []
    },
    {
        isbn: "9780451524935",
        title: "1984",
        author: "George Orwell",
        reviews: []
    },
    {
        isbn: "9780743273565",
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        reviews: []
    },
    {
        isbn: "9780544003415",
        title: "The Lord of the Rings",
        author: "J.R.R. Tolkien",
        reviews: []
    }
];

let users = [];
let reviews = [];

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Task 1: Get all books
app.get('/books', (req, res) => {
    res.json(books.map(book => ({
        isbn: book.isbn,
        title: book.title,
        author: book.author
    })));
});

// Task 2: Get book by ISBN
app.get('/books/isbn/:isbn', (req, res) => {
    const book = books.find(b => b.isbn === req.params.isbn);
    if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
});

// Task 3: Get books by author
app.get('/books/author/:author', (req, res) => {
    const authorBooks = books.filter(b => 
        b.author.toLowerCase().includes(req.params.author.toLowerCase())
    );
    res.json(authorBooks);
});

// Task 4: Get books by title
app.get('/books/title/:title', (req, res) => {
    const titleBooks = books.filter(b => 
        b.title.toLowerCase().includes(req.params.title.toLowerCase())
    );
    res.json(titleBooks);
});

// Task 5: Get book reviews
app.get('/books/reviews/:isbn', (req, res) => {
    const book = books.find(b => b.isbn === req.params.isbn);
    if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book.reviews);
});

// Task 6: Register new user
app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ message: 'Username, password, and email are required' });
    }

    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'Username already exists' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: users.length + 1,
            username,
            password: hashedPassword,
            email
        };
        users.push(newUser);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Task 7: Login user
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    try {
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );
        res.json({ token, message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: 'Error during login' });
    }
});

// Task 8: Add/Modify book review
app.post('/books/reviews/:isbn', authenticateToken, (req, res) => {
    const { review, rating } = req.body;
    const isbn = req.params.isbn;

    if (!review || !rating) {
        return res.status(400).json({ message: 'Review and rating are required' });
    }

    const book = books.find(b => b.isbn === isbn);
    if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user already has a review for this book
    const existingReviewIndex = book.reviews.findIndex(r => r.userId === req.user.id);
    
    if (existingReviewIndex >= 0) {
        // Modify existing review
        book.reviews[existingReviewIndex] = {
            ...book.reviews[existingReviewIndex],
            review,
            rating,
            updatedAt: new Date()
        };
        res.json({ message: 'Review updated successfully' });
    } else {
        // Add new review
        const newReview = {
            id: book.reviews.length + 1,
            userId: req.user.id,
            username: req.user.username,
            review,
            rating,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        book.reviews.push(newReview);
        res.status(201).json({ message: 'Review added successfully' });
    }
});

// Task 9: Delete book review
app.delete('/books/reviews/:isbn', authenticateToken, (req, res) => {
    const isbn = req.params.isbn;
    const book = books.find(b => b.isbn === isbn);

    if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }

    const reviewIndex = book.reviews.findIndex(r => r.userId === req.user.id);
    if (reviewIndex === -1) {
        return res.status(404).json({ message: 'Review not found' });
    }

    book.reviews.splice(reviewIndex, 1);
    res.json({ message: 'Review deleted successfully' });
});

// Task 10: Get all books using async/await with Axios
app.get('/api/books/async', async (req, res) => {
    try {
        // Simulating async operation with axios
        const fetchBooks = () => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(books.map(book => ({
                        isbn: book.isbn,
                        title: book.title,
                        author: book.author
                    })));
                }, 100);
            });
        };

        const booksList = await fetchBooks();
        res.json(booksList);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books' });
    }
});

// Task 11: Search by ISBN using Promises
app.get('/api/books/isbn-promise/:isbn', (req, res) => {
    const { isbn } = req.params;
    
    new Promise((resolve, reject) => {
        const book = books.find(b => b.isbn === isbn);
        if (book) {
            resolve(book);
        } else {
            reject(new Error('Book not found'));
        }
    })
    .then(book => res.json(book))
    .catch(error => res.status(404).json({ message: error.message }));
});

// Task 12: Search by Author using async/await
app.get('/api/books/author-async/:author', async (req, res) => {
    try {
        const { author } = req.params;
        
        const searchBooks = () => {
            return new Promise(resolve => {
                setTimeout(() => {
                    const authorBooks = books.filter(b => 
                        b.author.toLowerCase().includes(author.toLowerCase())
                    );
                    resolve(authorBooks);
                }, 100);
            });
        };

        const foundBooks = await searchBooks();
        res.json(foundBooks);
    } catch (error) {
        res.status(500).json({ message: 'Error searching books by author' });
    }
});

// Task 13: Search by Title using async/await
app.get('/api/books/title-async/:title', async (req, res) => {
    try {
        const { title } = req.params;
        
        const searchBooks = () => {
            return new Promise(resolve => {
                setTimeout(() => {
                    const titleBooks = books.filter(b => 
                        b.title.toLowerCase().includes(title.toLowerCase())
                    );
                    resolve(titleBooks);
                }, 100);
            });
        };

        const foundBooks = await searchBooks();
        res.json(foundBooks);
    } catch (error) {
        res.status(500).json({ message: 'Error searching books by title' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
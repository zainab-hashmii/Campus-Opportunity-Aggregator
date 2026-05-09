const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { connectDB } = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/bookmarks', require('./routes/bookmarks'));
app.use('/api/search',    require('./routes/search'));
app.use('/api/admin',     require('./routes/admin'));

app.get('/api/health', (_req, res) => {
    res.json({ message: 'Server is running', db: 'MongoDB' });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

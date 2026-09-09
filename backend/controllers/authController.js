const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Scan = require('../models/Scan');

const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';

const generateToken = (user) => {
    return jwt.sign(
        {
            user: {
                id: user.id,
                role: user.role
            }
        },
        jwtSecret,
        { expiresIn: '7d' }
    );
};

exports.register = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Please complete all required fields' });
    }

    if (password.length < 6) {
        return res.status(400).json({ msg: 'Password needs at least 6 characters' });
    }

            if (email.toLowerCase() === 'admin@gmail.com') {
                return res.status(400).json({ msg: 'Registration is not allowed for this admin email' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists with this email' });
        }

                    const user = new User({ email, password, role: 'user' });
                    await user.save();

        const token = generateToken(user);
        return res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server Error');
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
        if (email.toLowerCase() === 'admin@gmail.com' && password === 'admin@123') {
            let adminUser = await User.findOne({ email: 'admin@gmail.com' });
            if (!adminUser) {
                adminUser = new User({
                    email: 'admin@gmail.com',
                    password: 'admin@123',
                    role: 'admin'
                });
                await adminUser.save();
            }

            const token = generateToken(adminUser);
            return res.json({
                token,
                user: {
                    id: adminUser.id,
                    email: adminUser.email,
                    role: adminUser.role
                }
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials, please check your email' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials, please check your password' });
        }

        const token = generateToken(user);
        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server Error');
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        return res.json(user);
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server Error');
    }
};

exports.getUsers = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied: Admin privileges required' });
    }

    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const scanCount = await Scan.countDocuments({ userId: user._id });
                return {
                    _id: user._id,
                    email: user.email,
                    createdAt: user.createdAt,
                    scanCount
                };
            })
        );
        return res.json(usersWithStats);
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server Error');
    }
};

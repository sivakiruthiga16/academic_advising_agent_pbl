import User from '../models/User.js';
import Student from '../models/Student.js';
import Advisor from '../models/Advisor.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import admin from 'firebase-admin';
import cache from '../utils/cache.js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Firebase Admin Lazily
const initFirebase = () => {
    if (!admin.apps.length) {
        const projectId = process.env.FIREBASE_PROJECT_ID || (process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.split('-')[0] : null);
        
        if (!projectId || projectId === 'your-project-id') {
            console.error("FIREBASE_PROJECT_ID is missing in .env");
            return false;
        }

        admin.initializeApp({
            projectId: projectId
        });
        console.log("Firebase Admin initialized with Project ID:", projectId);
    }
    return true;
};

export const login = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    const { email, password } = req.body;

    try {
        console.log("Login attempt for email:", email);
        console.log("Using collection:", User.collection.name);
        
        let user = await User.findOne({ email });
        if (!user) {
            if (email === "sivakiruthigatsk@gmail.com") {
                return res.status(401).json({ msg: "Invalid admin credentials. Try again." });
            }
            return res.status(404).json({ msg: "User Not Found" });
        }

        // Only allow specific email to login as admin
        if (user.role === "admin" && email !== "sivakiruthigatsk@gmail.com") {
            return res.status(401).json({ msg: "Invalid admin credentials. Try again." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            if (user.role === "admin" || email === "sivakiruthigatsk@gmail.com") {
                return res.status(401).json({ msg: "Invalid admin credentials. Try again." });
            }
            return res.status(400).json({ msg: "Invalid Password" });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                console.log("MongoDB operation completed successfully");
                const loginMsg = (user.role === 'admin' || email === "sivakiruthigatsk@gmail.com") ? 'Welcome Admin!' : 'Login successful';
                res.json({ token, role: user.role, msg: loginMsg });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

export const getAdvisors = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    try {
        const cachedData = cache.get('public_advisors');
        if (cachedData) {
            console.log("Returning cached public advisors list");
            return res.json(cachedData);
        }

        console.log("Fetching advisors list");
        console.log("Using collection:", User.collection.name);
        // Optimize: Use lean() and specific fields
        const advisors = await User.find({ role: 'advisor' }).select('name email').lean();
        
        cache.set('public_advisors', advisors);
        console.log("MongoDB operation completed successfully");
        res.json(advisors);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

export const getMe = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    try {
        console.log("Fetching current user info:", req.user.user.id);
        console.log("Using collection:", User.collection.name);
        const user = await User.findById(req.user.user.id).select('-password');
        console.log("MongoDB operation completed successfully");
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const googleLogin = async (req, res) => {
    console.log("Incoming request:", req.method, req.originalUrl);
    const { credential } = req.body; // Firebase ID Token
    
    if (!initFirebase()) {
        return res.status(500).json({ msg: "Firebase configuration missing on server." });
    }

    try {
        // Verify Firebase ID Token
        const decodedToken = await admin.auth().verifyIdToken(credential);
        const { email, name, uid } = decodedToken;

        console.log("Google Login attempt for email:", email);
        console.log("Using collection:", User.collection.name);
        let user = await User.findOne({ email });
        
        if (!user) {
            console.log(`User ${email} not found in database.`);
            return res.status(404).json({ msg: `Email ${email} is not registered. Please contact Admin.` });
        }

        // If user exists but hasn't linked Google account, link it
        if (!user.googleId) {
            console.log(`Linking Google UID ${uid} to user ${email}`);
            user.googleId = uid;
            user.authType = 'google';
            await user.save();
        }

        const jwtPayload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            jwtPayload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                console.log("Google Login success for:", email);
                res.json({ token, role: user.role, msg: 'Google Login successful' });
            }
        );
    } catch (err) {
        console.error("Firebase Verify Error:", err);
        res.status(500).json({ msg: `Server error: ${err.message}` });
    }
};

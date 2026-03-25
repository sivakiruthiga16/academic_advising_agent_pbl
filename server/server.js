import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import path from "path";
import compression from "compression";
import { fileURLToPath } from "url";
import User from "./models/User.js";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import advisorRoutes from "./routes/advisorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import academicRoutes from "./routes/academicRoutes.js";

// Resolve __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Initialize Express
const app = express();

// CORS configuration for production
const allowedOrigins = [
  "http://localhost:5173", // Primary local dev
  "http://localhost:5174", // Alternative local dev
  "http://localhost:5175", // Another alternative local dev
  "https://academic-advising-agent.vercel.app", // Placeholder production frontend
  "https://academic-advising-agent-pbl.vercel.app", // Actual production frontend
];

app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(compression());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Check .env variables
if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI not defined in .env");
  process.exit(1);
}

// Use PORT 6000 as requested/implied by .env
const PORT = process.env.PORT || 6000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected Successfully");
    console.log("Database name:", mongoose.connection.name);

    // Create default admin if not exists
    try {
      const adminEmail = "sivakiruthigatsk@gmail.com";
      const adminExists = await User.findOne({ email: adminEmail });

      if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("admin123", salt);

        const newAdmin = new User({
          name: "Admin",
          email: adminEmail,
          password: hashedPassword,
          role: "admin",
        });

        await newAdmin.save();
        console.log("Default admin created successfully");
      } else {
        // Force update password to ensure it's correct
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("admin123", salt);
        adminExists.password = hashedPassword;
        adminExists.role = "admin"; // Ensure role is correct too
        await adminExists.save();
        console.log("Admin password reset to default successfully");
      }
    } catch (error) {
      console.error("Error creating default admin:", error);
    }
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Support both singular and plural for flexibility
app.use("/api/student", studentRoutes);
app.use("/api/students", studentRoutes);

app.use("/api/advisor", advisorRoutes);
app.use("/api/advisors", advisorRoutes);

app.use("/api/appointment", appointmentRoutes);
app.use("/api/appointments", appointmentRoutes);

app.use("/api/academic", academicRoutes);
app.use("/api/academics", academicRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Please change PORT in .env or free the port.`);
  } else {
    console.error("Server error:", err);
  }
});
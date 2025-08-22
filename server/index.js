import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./utils/database.js";
import routes from "./routes/router.js";

dotenv.config({ path: "./.env" });

const port = process.env.PORT || 4000;
const app = express();

// CORS configuration - allows all origins
const corsOptions = {
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: false // Set to true if you need to send cookies
};

app.use(cors(corsOptions));
app.use(express.json({limit: '10mb'}));

await connectDB();

app.use('/api', routes);

app.get("/", async (req, res) => {
  res.status(200).send("Server running ...");
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
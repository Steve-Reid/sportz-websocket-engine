import express from "express";
import { matchRouter } from "./routes/matches.js";

const app = express();

// Use JSON middleware
app.use(express.json());

// Root GET route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Express.js server!" });
});

// Matches GET route
app.use("/matches", matchRouter);

// Start server on port 8000
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

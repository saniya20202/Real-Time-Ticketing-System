const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Worker } = require("worker_threads");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Global state variables
let config = null;
let tickets = [];
let ticketsSold = 0;
let operationsRunning = false;
let releaseWorker = null;
let retrievalWorker = null;

// Route: Configure the system
app.post("/configure", (req, res) => {
  const { totalTickets, releaseRate, retrievalRate, maxCapacity } = req.body;

  console.log("Received configuration:", req.body);

  if (
    isNaN(totalTickets) ||
    isNaN(releaseRate) ||
    isNaN(retrievalRate) ||
    isNaN(maxCapacity) ||
    totalTickets <= 0 ||
    releaseRate <= 0 ||
    retrievalRate <= 0 ||
    maxCapacity <= 0
  ) {
    return res.status(400).json({ error: "All fields must be positive integers." });
  }

  if (maxCapacity > totalTickets) {
    return res
      .status(400)
      .json({ error: "Maximum ticket capacity cannot exceed total tickets." });
  }

  config = {
    totalTickets: parseInt(totalTickets),
    releaseRate: parseInt(releaseRate),
    retrievalRate: parseInt(retrievalRate),
    maxCapacity: parseInt(maxCapacity),
  };

  tickets = [];
  ticketsSold = 0;
  operationsRunning = false;

  res.json({ message: "Configuration saved successfully!" });
});

// Route: Start operations
app.post("/start", (req, res) => {
  if (!config) {
    return res.status(400).json({ error: "System is not configured yet." });
  }
  if (operationsRunning) {
    return res.status(400).json({ error: "Operations are already running." });
  }

  operationsRunning = true;

  // Start ticket release worker
  releaseWorker = new Worker("./releaseWorker.js", {
    workerData: {
      releaseRate: config.releaseRate,
      maxCapacity: config.maxCapacity,
      totalTickets: config.totalTickets,
    },
  });

  releaseWorker.on("message", (ticket) => {
    if (tickets.length < config.maxCapacity && ticketsSold < config.totalTickets) {
      tickets.push(ticket);
      console.log(`Ticket added: ${ticket}`);
    }
  });

  releaseWorker.on("error", (err) => console.error("Release Worker Error:", err));
  releaseWorker.on("exit", (code) => {
    if (code !== 0) console.error(`Release Worker stopped with exit code ${code}`);
  });

  // Start ticket retrieval worker
  retrievalWorker = new Worker("./retrievalWorker.js", {
    workerData: {
      retrievalRate: config.retrievalRate,
      totalTickets: config.totalTickets,
    },
  });

  retrievalWorker.on("message", (ticket) => {
    if (ticket) {
      if (tickets.length > 0) {
        const soldTicket = tickets.shift();
        ticketsSold++;
        console.log(`Ticket purchased: ${soldTicket}`);
        console.log(`Tickets sold: ${ticketsSold}/${config.totalTickets}`);
      }

      if (ticketsSold >= config.totalTickets) {
        console.log("All tickets sold. Stopping operations.");
        stopOperations();
      }
    }
  });

  retrievalWorker.on("error", (err) => console.error("Retrieval Worker Error:", err));
  retrievalWorker.on("exit", (code) => {
    if (code !== 0) console.error(`Retrieval Worker stopped with exit code ${code}`);
  });

  res.json({ message: "Ticket operations started." });
});

// Route: Stop operations
app.post("/stop", (req, res) => {
  if (!operationsRunning) {
    return res.status(400).json({ error: "Operations are not running." });
  }

  stopOperations();
  res.json({ message: "Ticket operations stopped." });
});

// Route: Reset system
app.post("/reset", (req, res) => {
  stopOperations();
  config = null;
  tickets = [];
  ticketsSold = 0;
  res.json({ message: "System reset successfully!" });
});

// Route: Fetch status
app.get("/status", (req, res) => {
  if (!config) {
    return res.status(400).json({ error: "System is not configured yet." });
  }

  const remainingTickets = config.totalTickets - ticketsSold;
  res.json({
    totalTickets: config.totalTickets,
    maxCapacity: config.maxCapacity,
    ticketsSold,
    remainingTickets,
    ticketsInQueue: tickets.length,
  });
});

// Helper function to stop workers
const stopOperations = () => {
  if (releaseWorker) {
    releaseWorker.terminate();
    releaseWorker = null;
  }
  if (retrievalWorker) {
    retrievalWorker.terminate();
    retrievalWorker = null;
  }
  operationsRunning = false;
};

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

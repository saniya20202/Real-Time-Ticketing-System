import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const App = () => {
  const [config, setConfig] = useState({
    totalTickets: "",
    releaseRate: "",
    retrievalRate: "",
    maxCapacity: "",
  });

  const [ticketData, setTicketData] = useState({
    totalTickets: 0,
    maxTickets: 0,
    ticketsSold: 0,
    remainingTickets: 0,
  });

  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Fetch current status periodically
    const fetchStatus = async () => {
      try {
        const response = await axios.get("http://localhost:5000/status");
        setTicketData(response.data);
      } catch (error) {
        console.error("Error fetching status:", error);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // Convert input values to numbers and validate them
    const totalTickets = Number(config.totalTickets);
    const releaseRate = Number(config.releaseRate);
    const retrievalRate = Number(config.retrievalRate);
    const maxCapacity = Number(config.maxCapacity);

    if (!totalTickets || !releaseRate || !retrievalRate || !maxCapacity) {
      alert("Please fill out all configuration fields.");
      return;
    }

    if (maxCapacity > totalTickets) {
      alert("Maximum ticket capacity cannot exceed total tickets.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/configure", {
        totalTickets,
        releaseRate,
        retrievalRate,
        maxCapacity,
      });
      alert(response.data.message);
      setTicketData({
        totalTickets,
        maxTickets: maxCapacity,
        ticketsSold: 0,
        remainingTickets: totalTickets,
      });
      setIsRunning(false);
    } catch (error) {
      alert(error.response?.data?.error || "Error saving configuration.");
    }
  };

  const handleStart = async () => {
    try {
      const response = await axios.post("http://localhost:5000/start");
      alert(response.data.message);
      setIsRunning(true);
    } catch (error) {
      alert("Error starting operations.");
    }
  };

  const handleStop = async () => {
    try {
      const response = await axios.post("http://localhost:5000/stop");
      alert(response.data.message);
      setIsRunning(false);
    } catch (error) {
      alert("Error stopping operations.");
    }
  };

  const handleReset = async () => {
    try {
      const response = await axios.post("http://localhost:5000/reset");
      alert(response.data.message);
      setTicketData({
        totalTickets: 0,
        maxTickets: 0,
        ticketsSold: 0,
        remainingTickets: 0,
      });
      setIsRunning(false);
    } catch (error) {
      alert("Error resetting system.");
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Ticket Management System</h1>
      </header>

      <div className="main-content">
        {/* Configuration Section */}
        <div className="box config-box">
          <h2>Configuration</h2>
          <form>
            <label>
              Total Tickets:
              <input
                type="number"
                name="totalTickets"
                value={config.totalTickets}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Ticket Release Rate (sec):
              <input
                type="number"
                name="releaseRate"
                value={config.releaseRate}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Customer Retrieval Rate (sec):
              <input
                type="number"
                name="retrievalRate"
                value={config.retrievalRate}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Max Ticket Capacity:
              <input
                type="number"
                name="maxCapacity"
                value={config.maxCapacity}
                onChange={handleInputChange}
              />
            </label>
            <button type="button" onClick={handleSave}>
              Save
            </button>
          </form>
        </div>

        {/* Status Section */}
        <div className="box status-box">
          <h2>Status</h2>
          <p>Total Tickets: {ticketData.totalTickets}</p>
          <p>Max Capacity: {ticketData.maxTickets}</p>
          <p>Tickets Sold: {ticketData.ticketsSold}</p>
          <p>Remaining Tickets: {ticketData.remainingTickets}</p>
        </div>

        {/* Control Panel */}
        <div className="box control-panel">
          <h2>Controls</h2>
          <button onClick={handleStart} disabled={isRunning}>
            Start
          </button>
          <button onClick={handleStop} disabled={!isRunning}>
            Stop
          </button>
          <button onClick={handleReset}>Reset</button>
        </div>
        
        <footer className="App-footer">
  <p>&copy; {new Date().getFullYear()} Real-Time Ticketing System. All rights reserved.</p>
</footer>

      </div>
    </div>
    
  );
};

export default App;
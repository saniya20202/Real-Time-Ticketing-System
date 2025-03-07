const { parentPort, workerData } = require("worker_threads");

const { releaseRate, maxCapacity, totalTickets } = workerData;
let ticketsReleased = 0;

const releaseTickets = () => {
  if (ticketsReleased < totalTickets) {
    if (ticketsReleased - ticketsRetrieved < maxCapacity) { // Ensure maxCapacity is respected
      ticketsReleased++;
      parentPort.postMessage(`Ticket-${ticketsReleased}`);
      setTimeout(releaseTickets, releaseRate * 1000);
    } else {
      // Wait and retry if capacity is reached
      setTimeout(releaseTickets, releaseRate * 1000);
    }
  } else {
    parentPort.postMessage(null); // Indicate completion
  }
};

let ticketsRetrieved = 0;
parentPort.on("message", (message) => {
  if (message === "ticketRetrieved") {
    ticketsRetrieved++;
  }
});

releaseTickets();

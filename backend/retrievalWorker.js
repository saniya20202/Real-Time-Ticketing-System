const { parentPort, workerData } = require("worker_threads");

const { retrievalRate, totalTickets } = workerData;
let ticketsRetrieved = 0;

const retrieveTickets = () => {
  if (ticketsRetrieved < totalTickets) {
    parentPort.postMessage(`Ticket-${ticketsRetrieved + 1}`);
    parentPort.postMessage("ticketRetrieved"); // Notify releaseWorker of retrieval
    ticketsRetrieved++;
    setTimeout(retrieveTickets, retrievalRate * 1000);
  } else {
    parentPort.postMessage(null); // Indicate completion
  }
};

retrieveTickets();

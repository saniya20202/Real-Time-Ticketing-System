import java.util.LinkedList;
import java.util.Queue;

public class TicketPool {
    private final Queue<String> tickets = new LinkedList<>();
    private final int maxCapacity;
    private final int totalTickets;
    private int ticketsSold = 0; // Track tickets sold
    private boolean completed = false;

    public TicketPool(int maxCapacity, int totalTickets) {
        this.maxCapacity = maxCapacity;
        this.totalTickets = totalTickets;
    }

    public synchronized void addTicket(String ticket) throws InterruptedException {
        while (tickets.size() == maxCapacity || ticketsSold >= maxCapacity) {
            wait(); // Wait until space is available or max capacity is reached
        }
        if (ticketsSold < maxCapacity) { // Only add tickets if max capacity isn't reached
            tickets.add(ticket);
            System.out.println("Ticket added: " + ticket + " | Current tickets: " + tickets.size());
            notifyAll(); // Notify consumers
        }
    }

    public synchronized String purchaseTicket() throws InterruptedException {
        while (tickets.isEmpty() && !completed) {
            wait(); // Wait until tickets are available or system is completed
        }

        if (ticketsSold >= maxCapacity) { // Stop consuming if max capacity is reached
            setCompleted();
            return null;
        }

        String ticket = tickets.poll();
        ticketsSold++;
        int remainingTickets = totalTickets - ticketsSold;
        System.out.println("Ticket purchased: " + ticket + " | Remaining tickets: " + remainingTickets);

        if (ticketsSold >= maxCapacity) { // Stop operations after max capacity is reached
            System.out.println("Maximum ticket capacity reached (" + maxCapacity + "). Stopping operations.");
            setCompleted();
        }

        notifyAll(); // Notify producers
        return ticket;
    }

    public synchronized void setCompleted() {
        completed = true;
        notifyAll(); // Notify all waiting threads to check the flag
    }
}

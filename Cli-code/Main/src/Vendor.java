public class Vendor implements Runnable {
    private final TicketPool ticketPool;
    private final int ticketsToProduce;
    private final int intervalInSeconds;

    public Vendor(TicketPool ticketPool, Configuration config) {
        this.ticketPool = ticketPool;
        this.ticketsToProduce = config.getTicketsToProduce();
        this.intervalInSeconds = config.getVendorInterval();
    }

    @Override
    public void run() {
        try {
            for (int i = 1; i <= ticketsToProduce; i++) {
                ticketPool.addTicket("Ticket-" + i);
                Thread.sleep(intervalInSeconds * 1000L); // Convert seconds to milliseconds
            }
        } catch (InterruptedException e) {
            System.err.println("Vendor interrupted: " + e.getMessage());
        }
    }
}

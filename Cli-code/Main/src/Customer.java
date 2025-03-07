public class Customer implements Runnable {
    private final TicketPool ticketPool;
    private final int intervalInSeconds;

    public Customer(TicketPool ticketPool, Configuration config) {
        this.ticketPool = ticketPool;
        this.intervalInSeconds = config.getCustomerInterval();
    }

    @Override
    public void run() {
        try {
            while (true) {
                String ticket = ticketPool.purchaseTicket();
                if (ticket == null) {
                    System.out.println("System completed all operations. Customer is exiting.");
                    break;
                }
                Thread.sleep(intervalInSeconds * 1000L ); // Convert seconds to milliseconds
            }
        } catch (InterruptedException e) {
            System.err.println("Customer interrupted: " + e.getMessage());
        }
    }
}

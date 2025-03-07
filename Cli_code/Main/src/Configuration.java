public class Configuration {
    private final int maxCapacity;
    private final int ticketsToProduce;
    private final int vendorInterval; // Interval in seconds
    private final int customerInterval; // Interval in seconds

    public Configuration(int maxCapacity, int ticketsToProduce, int vendorInterval, int customerInterval) {
        this.maxCapacity = maxCapacity;
        this.ticketsToProduce = ticketsToProduce;
        this.vendorInterval = vendorInterval;
        this.customerInterval = customerInterval;
    }

    public int getMaxCapacity() {
        return maxCapacity;
    }

    public int getTicketsToProduce() {
        return ticketsToProduce;
    }

    public int getVendorInterval() {
        return vendorInterval;
    }

    public int getCustomerInterval() {
        return customerInterval;
    }

    @Override
    public String toString() {
        return "Configuration{" +
                "maxCapacity=" + maxCapacity +
                ", ticketsToProduce=" + ticketsToProduce +
                ", vendorInterval=" + vendorInterval + " seconds" +
                ", customerInterval=" + customerInterval + " seconds" +
                '}';
    }
}

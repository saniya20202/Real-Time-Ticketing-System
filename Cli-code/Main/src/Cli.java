import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Scanner;

public class Cli {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.println("Welcome to the Real-Time Ticketing System Configuration");

        // Input configuration in the specified order
        int totalTickets = promptForPositiveInt(scanner, "Enter the total number of tickets (totalTickets): ");
        int ticketReleaseRate = promptForPositiveInt(scanner, "Enter the ticket release rate (ticketReleaseRate in seconds): ");
        int customerRetrievalRate = promptForPositiveInt(scanner, "Enter the customer retrieval rate (customerRetrievalRate in seconds): ");
        int maxTicketCapacity;

        // Validate maximum ticket capacity
        while (true) {
            maxTicketCapacity = promptForPositiveInt(scanner, "Enter the maximum ticket capacity (maxTicketCapacity): ");
            if (maxTicketCapacity <= totalTickets) {
                break; // Valid input
            }
            System.out.println("Maximum ticket capacity cannot exceed the total number of tickets. Please re-enter.");
        }

        // Write input data to text and JSON files
        logInputData(totalTickets, ticketReleaseRate, customerRetrievalRate, maxTicketCapacity);

        // Create configuration object
        Configuration config = new Configuration(maxTicketCapacity, totalTickets, ticketReleaseRate, customerRetrievalRate);
        System.out.println("Configuration set: " + config);

        // Initialize the ticket pool
        TicketPool ticketPool = new TicketPool(config.getMaxCapacity(), config.getTicketsToProduce());

        // Initialize threads
        Thread vendorThread = new Thread(new Vendor(ticketPool, config));
        Thread customerThread = new Thread(new Customer(ticketPool, config));

        System.out.println("\nCommands: ");
        System.out.println("1. start - Start ticket operations");
        System.out.println("2. stop - Stop ticket operations and exit");

        while (true) {
            System.out.print("Enter a command: ");
            String command = scanner.nextLine().trim().toLowerCase();

            if (command.equals("start")) {
                vendorThread.start();
                customerThread.start();
                System.out.println("Ticket operations started.");
                try {
                    vendorThread.join();
                    customerThread.join();
                } catch (InterruptedException e) {
                    System.err.println("Error stopping threads: " + e.getMessage());
                }
                break; // Exit after operations
            } else if (command.equals("stop")) {
                ticketPool.setCompleted();
                System.out.println("Ticket operations stopped. Exiting...");
                break;
            } else {
                System.out.println("Invalid command. Please enter 'start' or 'stop'.");
            }
        }

        // Display remaining tickets
        int remainingTickets = totalTickets - maxTicketCapacity;
        System.out.println("Program ended. Remaining tickets: " + remainingTickets);
    }

    private static int promptForPositiveInt(Scanner scanner, String prompt) {
        int value;
        while (true) {
            System.out.print(prompt);
            if (scanner.hasNextInt()) {
                value = scanner.nextInt();
                if (value > 0) {
                    scanner.nextLine(); // Consume newline
                    return value;
                }
            }
            System.out.println("Invalid input. Please enter a positive integer.");
            scanner.nextLine(); // Clear invalid input
        }
    }

    private static void logInputData(int totalTickets, int ticketReleaseRate, int customerRetrievalRate, int maxTicketCapacity) {
        // Write input data to text file
        try (BufferedWriter writer = new BufferedWriter(new FileWriter("input_logs.txt", true))) {
            writer.write("Configuration Data:");
            writer.newLine();
            writer.write("Total Tickets: " + totalTickets);
            writer.newLine();
            writer.write("Ticket Release Rate: " + ticketReleaseRate + " seconds");
            writer.newLine();
            writer.write("Customer Retrieval Rate: " + customerRetrievalRate + " seconds");
            writer.newLine();
            writer.write("Maximum Ticket Capacity: " + maxTicketCapacity);
            writer.newLine();
            writer.write("--------------------------------------------");
            writer.newLine();
        } catch (IOException e) {
            System.err.println("Error writing configuration to text file: " + e.getMessage());
        }

        // Write input data to JSON file
        try (BufferedWriter writer = new BufferedWriter(new FileWriter("input_logs.json", true))) {
            writer.write("{");
            writer.write("\"totalTickets\": " + totalTickets + ", ");
            writer.write("\"ticketReleaseRate\": " + ticketReleaseRate + ", ");
            writer.write("\"customerRetrievalRate\": " + customerRetrievalRate + ", ");
            writer.write("\"maxTicketCapacity\": " + maxTicketCapacity);
            writer.write("}");
            writer.newLine();
        } catch (IOException e) {
            System.err.println("Error writing configuration to JSON file: " + e.getMessage());
        }
    }
}

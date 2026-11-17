import java.util.Scanner;

public class ElectricityBill {

    public static double calculateBill(double units) {
        if (units < 0) {
            throw new IllegalArgumentException("Units cannot be negative.");
        }

        double energyCharges = 0;
        double fixedCharges = 50.0; // standard fixed charge
        double taxRate = 0.05; // 5% electricity tax

        if (units <= 100) {
            energyCharges = units * 1.50;
        } else if (units <= 200) {
            energyCharges = (100 * 1.50) + ((units - 100) * 2.50);
        } else if (units <= 300) {
            energyCharges = (100 * 1.50) + (100 * 2.50) + ((units - 200) * 4.00);
        } else {
            energyCharges = (100 * 1.50) + (100 * 2.50) + (100 * 4.00) + ((units - 300) * 6.00);
        }

        double tax = energyCharges * taxRate;
        return energyCharges + fixedCharges + tax;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.println("=========================================");
        System.out.println("     ELECTRICITY BILL CALCULATOR (JAVA)  ");
        System.out.println("=========================================");
        System.out.print("Enter units consumed: ");

        if (!sc.hasNextDouble()) {
            System.out.println("Invalid input! Please enter a numerical unit count.");
            sc.close();
            return;
        }

        double units = sc.nextDouble();

        if (units < 0) {
            System.out.println("Units consumed cannot be negative.");
            sc.close();
            return;
        }

        double totalBill = calculateBill(units);

        System.out.println("-----------------------------------------");
        System.out.printf("Units Consumed : %.2f kWh\n", units);
        System.out.printf("Total Bill     : Rs. %.2f\n", totalBill);
        System.out.println("=========================================");

        sc.close();
    }
}

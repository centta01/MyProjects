import java.util.Scanner;

public class Hello {
    public static void main(String[] args) {
        BotTalker bt = new BotTalker();
        Scanner kb = new Scanner(System.in);
        while(true) {
            String input = kb.nextLine();
            if (input.equals("-1"))
                break;
            String output = bt.sendMessage(input);
            System.out.println(output);
        }
    }
}

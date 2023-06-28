import javax.swing.*;
import java.awt.*;
import java.awt.event.KeyListener;
import java.awt.event.KeyEvent;
import java.lang.Math;

public class GUI extends JFrame implements KeyListener{
    JPanel p=new JPanel();
    JTextArea dialog=new JTextArea(45,100);
    JTextArea input=new JTextArea(1,100);
    BotTalker bot;

    JScrollPane scroll=new JScrollPane(
            dialog,
            JScrollPane.VERTICAL_SCROLLBAR_AS_NEEDED,
            JScrollPane.HORIZONTAL_SCROLLBAR_NEVER
    );
    String[][] chatBot={
    };

    public GUI(){
        super("Chat Bot");
        input.setToolTipText("Insert request here");
        setSize(1200,800);
        setResizable(false);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        dialog.setEditable(false);
        input.addKeyListener(this);;
        dialog.setBackground(Color.darkGray);
        scroll.getViewport().getView().setForeground(Color.WHITE);
        input.setBackground(Color.darkGray);
        input.setForeground(Color.WHITE);
        p.add(scroll);
        p.add(input);
        p.setBackground(new Color(128,128,128));
        add(p);
        bot = new BotTalker();



        setVisible(true);
    }
    public void keyPressed(KeyEvent e) {

        if (e.getKeyCode() == KeyEvent.VK_ENTER) {
            input.setEditable(false);

//-----grab quote-----------
            if (input.getText().isEmpty()) {
                addText("\nEVA: Please enter a complete sentence.");
            }
            else {
                String quote = input.getText();
                input.setText("");
                addText("You: " + quote);
                String response = bot.sendMessage(quote);
//-----default--------------
                if(response.equals("")){
                    addText("\nEVA: Sorry, I couldn't find anything.");
                }
                else
                    addText("\nEVA: " + response);
            }
            addText("\n");
        }
    }
    public void keyReleased(KeyEvent e){
        if(e.getKeyCode()==KeyEvent.VK_ENTER){
            input.setEditable(true);
        }
    }

    public void keyTyped(KeyEvent e){}

    public void addText(String str){
        dialog.setText(dialog.getText()+str);
    }

    public boolean inArray(String in,String[] str){
        boolean match=false;
        for(int i=0;i<str.length;i++){
            if(str[i].equals(in)){
                match=true;
            }
        }
        return match;
    }
    public static void main(String[] args){
        new GUI();

    }

}
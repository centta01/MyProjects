import javax.swing.*;
import java.awt.*;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class clientGUI extends JFrame implements KeyListener {
    JPanel p=new JPanel();
    JTextArea dialog=new JTextArea(45,100);
    JTextArea input=new JTextArea(1,100);


    JScrollPane scroll=new JScrollPane(
            dialog,
            JScrollPane.VERTICAL_SCROLLBAR_AS_NEEDED,
            JScrollPane.HORIZONTAL_SCROLLBAR_NEVER
    );
    String[][] chatBot={
    };
    private HttpClient client;
    private String response;
    private final static String URI = "http://10.134.96.27:8000/";
    public clientGUI(){
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

        client = HttpClient.newHttpClient();




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
                String requestUrl = URI + quote.replace(" ", "%20");
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(java.net.URI.create(requestUrl))
                        .header("size", "" + requestUrl.length())
                        .build();
                try{
                    HttpResponse<String> answer = client.send(request, HttpResponse.BodyHandlers.ofString());
                    response = answer.body();


                }
                catch (IOException | InterruptedException ex){
                    ex.printStackTrace();
                }

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
        new clientGUI();
    }
}



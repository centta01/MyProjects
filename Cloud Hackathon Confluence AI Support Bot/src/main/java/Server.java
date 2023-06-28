import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;

public class Server {
    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8000), 0);
        Server s = new Server();
        Handler handler = s.new Handler();
        server.createContext("/",handler);
        server.setExecutor(null);
        server.start();
        System.out.println("Server Started");
    }
    class Handler implements HttpHandler {
        @Override
        public void handle(HttpExchange t) throws IOException {
            BotTalker bot = new BotTalker();
            String response = bot.sendMessage(t.getRequestURI().toString().substring(1).replace("%20"," "));
            t.sendResponseHeaders(200, response.length());
            OutputStream os = t.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }
    }
}

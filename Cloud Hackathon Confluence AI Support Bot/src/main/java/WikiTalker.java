import software.amazon.awssdk.services.kafkaconnect.model.ScaleOutPolicy;

import java.io.IOException;
import java.net.URI;
import java.net.http.*;
public class WikiTalker {
    public static void main(String[] args) {
        HttpClient client = HttpClient.newHttpClient();
        String apiURL = "https://en.wikipedia.org/w/api.php";
        String param = "?action=query&format=json&list=search&srsearch=Indiana%20DMV";
        String requestURL = apiURL + param;
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(requestURL))
                .build();
        try{
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            int status = response.statusCode();
            HttpHeaders headers = response.headers();
            String body = response.body();

            System.out.println("Status code: " + status);
            System.out.println("Headers: " + headers);
            System.out.println("Response body: " + body);
        }
        catch (IOException | InterruptedException e){
            e.printStackTrace();
        }
    }
}

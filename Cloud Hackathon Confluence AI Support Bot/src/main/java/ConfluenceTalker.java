import org.json.simple.JSONObject;
import org.json.simple.JSONArray;
import org.json.simple.JSONValue;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.IOException;
import java.net.URI;
import java.net.http.*;
public class ConfluenceTalker {
    public static void main(String[] args) {
        HttpClient client = HttpClient.newHttpClient();
        String api = "https://confluence.test.build.us.idemia.io/rest/api/content/";
        String search = "UX";
        String searchUrl = "search?cql=text~";
        String textUrl = "&expand=body.view&limit=5";
        String testUrl = "https://confluence.test.build.us.idemia.io/rest/api/content/search?cql=text~aws&expand=body.view";
        String requestUrl = api + searchUrl + search + textUrl;



        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(requestUrl))
                .header("Authorization", "Bearer " + "MDAwOTIxOTUyMjAyOrqL2R/utdFuWqD4cFQY9yw6OmdY")
                .build();

        try{
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            int status = response.statusCode();
            HttpHeaders headers = response.headers();
            String body = response.body();

            System.out.println("Status code: " + status);
//            System.out.println("Headers: " + headers);
//           System.out.println("Response body: " + body);

            String[] htmls = parseJson(body);
            HtmlDoc[] docText = parseHtml(htmls);
//            Document doc = Jsoup.parse(htmls[0]);
//            Elements allElements = doc.getAllElements();
//            for(Element element : allElements){
//                if(element.tagName().matches("h[1-6]|table|ul|ol|li|p"))
//                    System.out.println(element.text());
//            }


        }
        catch (IOException | InterruptedException e){
            e.printStackTrace();
        }

    }

    public static String[] parseJson(String input){
        try {
            JSONParser parser = new JSONParser();
            JSONObject json = (JSONObject) parser.parse(input);
            JSONArray results = (JSONArray) json.get("results");
            String[] output = new String[results.size()];
            for (int i = 0; i < results.size(); i++) {
                JSONObject temp = (JSONObject) results.get(i);
                String value = (String) ((JSONObject) ((JSONObject) temp.get("body")).get("view")).get("value");
                output[i] = value;
            }
            return output;
        }
        catch (ParseException e){
            e.printStackTrace();
            return null;
        }
    }

    public static HtmlDoc[] parseHtml(String[] htmls){
        HtmlDoc[] output = new HtmlDoc[htmls.length];
        for(int i = 0; i < htmls.length; i++){
            Document doc = Jsoup.parse(htmls[i]);
            Elements allElements = doc.getAllElements();
            HtmlElement[] temp = new HtmlElement[allElements.size()];
            for(int j = 0; j < temp.length; j++){
                if(allElements.get(j).tagName().matches("h[1-6]|table|ul|ol|li|p"))
                    temp[j] = new HtmlElement(allElements.get(j).tagName(), allElements.get(j).text());
            }
            output[i] = new HtmlDoc(temp);
        }
        return output;
    }
}

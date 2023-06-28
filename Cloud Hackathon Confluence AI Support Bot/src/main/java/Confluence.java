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
public class Confluence {
    private final String API_URL = "";
    private final String SEARCH_URL = "search?cql=text~";
    private final String TEXT_URL = "&expand=body.view&limit=";
    private int limit;
    private String search;
    private HttpClient client;

    public Confluence(String search, int limit){
        this.search = search;
        this.search.replace(" ", "%20");
        this.limit = limit;
        client = HttpClient.newHttpClient();
    }

    public Confluence(int limit){
        this.limit = limit;
        client = HttpClient.newHttpClient();
    }

    public Confluence(String search){
        this.search = search.replace(" ", "%20");
        limit = 5;
        client = HttpClient.newHttpClient();
    }
    public Confluence(){
        limit = 5;
        client = HttpClient.newHttpClient();
    }
    public String[] parseJson(String input){
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
            System.out.println("Parse Exception");
            e.printStackTrace();
            return null;
        }
    }

    public HtmlDoc[] parseHtml(String[] htmls){
        HtmlDoc[] output = new HtmlDoc[htmls.length];
        for(int i = 0; i < htmls.length; i++){
            Document doc = Jsoup.parse(htmls[i]);
            Elements allElements = doc.getAllElements();
            HtmlElement[] temp = new HtmlElement[allElements.size()];
            int index = 0;
            for(int j = 0; j < allElements.size(); j++){
                if(allElements.get(j).tagName().matches("h[1-6]|p")) {
                    temp[index] = new HtmlElement(allElements.get(j).tagName(), allElements.get(j).text());
                    index++;
                }
//                System.out.println(allElements.get(j).text());
            }
            output[i] = new HtmlDoc(temp);
        }
        return output;
    }

    public HtmlDoc[] Search(){
        if(search == null)
            return null;

        String requestUrl = API_URL + SEARCH_URL + search + TEXT_URL + limit;
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(requestUrl))
                .header("Authorization", "Bearer " + "MDAwOTIxOTUyMjAyOrqL2R/utdFuWqD4cFQY9yw6OmdY")
                .build();

        HtmlDoc[] docText;
        try{
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            int status = response.statusCode();
            HttpHeaders headers = response.headers();
            String body = response.body();

//            System.out.println("Status code: " + status);

            String[] htmls = parseJson(body);
            docText = parseHtml(htmls);
            return docText;

        }
        catch (IOException | InterruptedException e){
            e.printStackTrace();
        }
        return null;
    }
    public HtmlDoc[] Search(String search){
        if(search == null)
            return null;
        search = search.replace(" ", "%20");
        String requestUrl = API_URL + SEARCH_URL + search + TEXT_URL + limit;
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(requestUrl))
                .header("Authorization", "Bearer " + "MDAwOTIxOTUyMjAyOrqL2R/utdFuWqD4cFQY9yw6OmdY")
                .build();

        HtmlDoc[] docText;
        try{
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            int status = response.statusCode();
            HttpHeaders headers = response.headers();
            String body = response.body();

//            System.out.println("Status code: " + status);

            String[] htmls = parseJson(body);
            docText = parseHtml(htmls);
            return docText;

        }
        catch (IOException | InterruptedException e){
            e.printStackTrace();
        }
        return null;
    }
}

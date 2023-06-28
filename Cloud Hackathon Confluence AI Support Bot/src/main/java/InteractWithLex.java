import com.amazonaws.services.lexmodelbuilding.model.SlotTypeMetadata;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.lexmodelbuilding.LexModelBuildingClient;
import software.amazon.awssdk.services.lexmodelsv2.model.ListSlotTypesRequest;
import software.amazon.awssdk.services.lexmodelsv2.model.ListSlotTypesResponse;
import software.amazon.awssdk.services.lexruntimev2.LexRuntimeV2Client;
import software.amazon.awssdk.services.lexruntimev2.model.RecognizeTextRequest;
import software.amazon.awssdk.services.lexruntimev2.model.RecognizeTextResponse;
import software.amazon.awssdk.services.lexmodelbuilding.LexModelBuildingClient;
import software.amazon.awssdk.services.lexmodelbuilding.model.*;

import java.net.URISyntaxException;
import java.util.Scanner;
import java.util.UUID;
public class InteractWithLex {
    public static void main(String[] args) throws URISyntaxException, InterruptedException {
        String botId = "XZGFBCRTZB";
        String botAliasId = "TSTALIASID";
        String localeId = "en_US";
        String accessKey = "AKIA2PQFCE6J2O3GFRRO";
        String secretKey = "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";
        String sessionId = UUID.randomUUID().toString();
        Region region = Region.US_EAST_1; // pick an appropriate region
        Confluence talker = new Confluence(1);

        AwsBasicCredentials awsCreds = AwsBasicCredentials.create(accessKey, secretKey);
        AwsCredentialsProvider awsCredentialsProvider = StaticCredentialsProvider.create(awsCreds);

        LexRuntimeV2Client lexV2Client = LexRuntimeV2Client
                .builder()
                .credentialsProvider(awsCredentialsProvider)
                .region(region)
                .build();

        String userInput = "";
        Scanner kb = new Scanner(System.in);
        System.out.println("Enter text for bot:");
        while(true){
            userInput = kb.nextLine();
            if(userInput.equals("-1"))
                break;

            RecognizeTextRequest recognizeTextRequest = getRecognizeTextRequest(botId, botAliasId, localeId, sessionId, userInput);
            RecognizeTextResponse recognizeTextResponse = lexV2Client.recognizeText(recognizeTextRequest);
            recognizeTextResponse.messages().forEach(message -> {
                String response = message.content();
                if (response.startsWith("Query:")){
                    response = response.substring(7);
                    HtmlDoc[] results = talker.Search(response);
                    HtmlElement[] elements = results[0].getElements();

                    System.out.println("Here's what I found:");
                    for(int i = 0; i < elements.length; i++){
                        if(elements[i] != null)
                            System.out.println(elements[i].getText());
                    }
                }
                else{
                    System.out.println(response);
                }
            });
        }
    }

    private static RecognizeTextRequest getRecognizeTextRequest(String botId, String botAliasId, String localeId, String sessionId, String userInput) {
        RecognizeTextRequest recognizeTextRequest = RecognizeTextRequest.builder()
                .botId(botId)
                .botAliasId(botAliasId)
                .localeId(localeId)
                .sessionId(sessionId)
                .text(userInput)
                .build();
        return recognizeTextRequest;
    }

}

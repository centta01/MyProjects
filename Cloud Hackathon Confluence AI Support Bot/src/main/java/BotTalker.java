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

import java.util.UUID;

public class BotTalker {
    private String botId = "XZGFBCRTZB";
    private String botAliasId = "TSTALIASID";
    private String localeId = "en_US";
    private String accessKey = "AKIA2PQFCE6J2O3GFRRO";
    private String secretKey = "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";
    private Region region = Region.US_EAST_1;
    private String sessionId;
    private Confluence talker;
    private LexRuntimeV2Client lexV2Client;

    public String response;

    public BotTalker(){
        sessionId = UUID.randomUUID().toString();
        talker = new Confluence(1);
        AwsBasicCredentials awsCreds = AwsBasicCredentials.create(accessKey, secretKey);
        AwsCredentialsProvider awsCredentialsProvider = StaticCredentialsProvider.create(awsCreds);

        lexV2Client = LexRuntimeV2Client
                .builder()
                .credentialsProvider(awsCredentialsProvider)
                .region(region)
                .build();
    }
    private RecognizeTextRequest getRecognizeTextRequest(String botId, String botAliasId, String localeId, String sessionId, String userInput) {
        RecognizeTextRequest recognizeTextRequest = RecognizeTextRequest.builder()
                .botId(botId)
                .botAliasId(botAliasId)
                .localeId(localeId)
                .sessionId(sessionId)
                .text(userInput)
                .build();
        return recognizeTextRequest;
    }

    public String sendMessage(String userInput){
        RecognizeTextRequest recognizeTextRequest = getRecognizeTextRequest(botId, botAliasId, localeId, sessionId, userInput);
        RecognizeTextResponse recognizeTextResponse = lexV2Client.recognizeText(recognizeTextRequest);
        recognizeTextResponse.messages().forEach(message -> {
            response = message.content();
            if (response.startsWith("Query:")) {
                response = response.substring(7);
                HtmlDoc[] results = talker.Search(response);
                response = results[0].toString();
            }
        });
        return response;
    }


}

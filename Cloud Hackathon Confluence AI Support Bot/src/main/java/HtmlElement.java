public class HtmlElement {
    private String tag;
    private String text;

    public HtmlElement(String tag, String text){
        this.tag = tag;
        this.text = text;
    }

    public String getTag(){
        return tag;
    }

    public String getText(){
        return text;
    }

    public String[] getElement(){
        return new String[] {tag, text};
    }
}

public class HtmlDoc {
    private HtmlElement[] elements;

    public HtmlDoc(HtmlElement[] elements){
        this.elements = elements;
    }

    public HtmlElement[] getElements(){
        return elements;
    }

    public HtmlElement getElementFromIndex(int i){
        if(i < 0 || i > elements.length)
            return null;
        return elements[i];
    }

    public String toString(){
        String output = "";
        for(int i = 0; i < elements.length; i++){
            if(elements[i] == null)
                break;
            if(!(elements[i].getText().equals("")) | !(elements[i].getText().equals("\n"))){
                output += "\n" + elements[i].getText();
            }
        }
        return output;
    }
}

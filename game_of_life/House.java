import javafx.scene.paint.Color;
import javafx.scene.shape.Rectangle;

public class House {
    private Rectangle rectangle;
    private boolean checked;
    private boolean isOccupied;
    //x&y of array
    private int x;
    private int y;

    public House(int x, int y, Rectangle rectangle){
        this.x = x;
        this.y = y;
        this.checked = false;
        this.isOccupied = false;
        this.rectangle = rectangle;
    }

    public Rectangle getRectangle(){ return rectangle; }

    public void setRectangle(Rectangle rectangle){ this.rectangle = rectangle;}

    public void setRectangleColor(Color color){
        rectangle.setFill(color);
    }

    public boolean isChecked(){
        return checked;
    }

    public void setChecked(boolean checked){
        this.checked = checked;
    }

    public int getX(){
        return x;
    }

    public int getY(){
        return y;
    }

    public boolean isOccupied(){
        return isOccupied;
    }

    public void setOccupied(Boolean isOccupied){
        this.isOccupied = isOccupied;
    }
}

import javafx.scene.paint.Color;
import javafx.scene.shape.Rectangle;

/**
 * Created by Jack on 6/5/2016.
 */
public class House {
    private Coordinate cord;
    private int neighbors;
    private Rectangle rectangle;
    private boolean checked = true;

    public House(Coordinate cord, Rectangle rectangle, int neighbors){
        this.cord = cord;
        this.neighbors = neighbors;
        this.rectangle = rectangle;
    }

    public int getNeighbors() {
        return neighbors;
    }

    public void setNeighbors(int neighbors) {
        this.neighbors = neighbors;
    }

    public Coordinate getCord() {
        return cord;
    }

    public void setCord(Coordinate cord) {
        this.cord = cord;
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
}

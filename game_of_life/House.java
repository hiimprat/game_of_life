import javafx.scene.paint.Color;
import javafx.scene.shape.Rectangle;

/**
 * Created by Jack on 6/5/2016.
 */
public class House {
    private Coordinate cord;
    private int neighbors;
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

    public House(Coordinate cord, Rectangle rectangle, int neighbors){
        this.cord = cord;
        this.neighbors = neighbors;
        this.rectangle = rectangle;
        this.x = (cord.getX()+100)/10;
        this.y = (cord.getY()+100)/10;
        this.checked = false;
        this.isOccupied = false;

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

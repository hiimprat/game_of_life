/**
 * Created by Jack on 6/5/2016.
 */
public class House {
    private Coordinate cord;
    private int neighbors;

    public House(Coordinate cord, int neighbors){
        this.cord = cord;
        this.neighbors = neighbors;
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


}

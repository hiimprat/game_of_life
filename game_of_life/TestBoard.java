
import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Slider;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.shape.Rectangle;
import javafx.stage.Stage;
import java.util.*;


public class TestBoard extends Application {

    /*The board is 90x90. There is a 10 Block
    buffer zone around the Board.
     */

    //Keeps a refrence to each house, it's coordinate, and it's rectangle associatd with it.
    private House[][] boardOfHouses = new House[110][110];
    //Keeps track of the number of neighbors of each house respectively
    private int[][] boardOfNeighbors = new int[110][110];

    //Houses that are currently on the board, Linked list for removing houses
    private LinkedList<House> currentHouses = new LinkedList<>();
    //Houses that I've checked so far (for counting)
    private Stack<House> checkedHouses = new Stack<>();
    //houses that will be in the new board;
    private Stack<House> newHouses = new Stack<>();

    //This is the pane where the houses will be projected on
    private Pane board;

    //is game paused
    private boolean paused = true;
    //Used for a new thread for counting neighbors while responding to user
    private Timer timer;
    //Used to get refresh rate
    private Slider speedSlider;

    /*Start App*/
    public static void main(String[] args) {
        launch(args);
    }

    @Override
    public void start(Stage primaryStage) {
    //declare objects needed
        board = new Pane();
        Pane pane = new Pane();
        VBox vb = new VBox();
        HBox hb = new HBox();
        Button playPauseBtn = new Button();
        Button clearBoardBtn = new Button();
        speedSlider = new Slider();

    //title of app and basic startup procedures
        primaryStage.setTitle("Test Board");
        setUpBoard();
        //draw the entire board once
        drawWholeBoard();
        /*Make a Vbox containing an HBox and the grid under it
            Hbox will contain buttons and slider for function
            Vbox will contain Hbox and the Board
        */
        hb.getChildren().addAll(playPauseBtn, clearBoardBtn, speedSlider);
        vb.getChildren().addAll(hb, board);
        pane.getChildren().add(vb);

    //configure buttons
        playPauseBtn.setText(" Play ");
        playPauseBtn.setMinWidth(60);
        clearBoardBtn.setText("Clear Board");

    //configure slider
        speedSlider.setMin(200);
        speedSlider.setMax(1000);
        speedSlider.setValue(500);
        speedSlider.setShowTickLabels(true);
        speedSlider.setShowTickMarks(true);
        speedSlider.setMajorTickUnit(200);
        speedSlider.setMinorTickCount(5);
        speedSlider.setBlockIncrement(100);

    //configure Vbox and Hbox
        //HBox currently 77 px tall
        vb.setStyle("-fx-background-color: #00e699;");
        vb.setMinWidth(901);
        hb.setPadding(new Insets(20,20,10,20));
        hb.setSpacing(20);

    //Events
        board.setOnMousePressed((MouseEvent e) -> {
            mousePressed(e);
        });
        board.setOnMouseDragged((MouseEvent e) ->{
            mousePressed(e);
        });
        clearBoardBtn.setOnAction((event) -> {
            clearBoard();
        });
        playPauseBtn.setOnAction((event)-> {
            playPauseGame(playPauseBtn);
        });

    //create background
        primaryStage.setScene(new Scene(pane, 901, 966));

    //show app
        primaryStage.show();
    }

    //Associates a rectangle with a spot on the board with respect to the house at that given spot
    private void setUpBoard(){
        for(int yIndex = 0; yIndex < 110; yIndex++){
            for(int xIndex = 0; xIndex < 110; xIndex++){
                Rectangle r = new Rectangle(xIndex*10-99, yIndex*10-99,9,9);
                boardOfHouses[xIndex][yIndex]= new House(xIndex, yIndex, r);
            }
        }
    }

    /* double for loop creating the whole board with lines and blocks*/
    private void drawWholeBoard(){
    //start at 10,10 to only show the middle 100 blocks of the board since there is a 10 block buffer zone around the perimeter
        for (int yCord = 10; yCord < 100; yCord++) {
            for (int xCord = 10; xCord < 100; xCord++) {
                House currentHouse = boardOfHouses[xCord][yCord];
                Rectangle currentRectangle = currentHouse.getRectangle();
                if (currentHouse.isOccupied())
                    currentRectangle.setFill(Color.web("#80bfff"));
                else
                    currentRectangle.setFill(Color.WHITE);
                //only add the rectangles that need to be shown. Change this for expandability.
                board.getChildren().add(currentRectangle);
            }
        }
    }

    private void mousePressed(MouseEvent e) {
        //Sets coordinate of mouse click to match x and y cords of the board
        int xCord = ((int) Math.round(e.getSceneX())+100)/10;
        //-77 here because the top of the actual page is 77 px tall
        int yCord = (((int) Math.round(e.getSceneY())-77)+100)/10;
        //if mouse is valid, then proceed
        if (!isValid(xCord, yCord))
            return;
        House currentHouse = boardOfHouses[xCord][yCord];

        //Left click creates homes, right click deletes
        if(e.isPrimaryButtonDown()) {
            //if house already there, then don't do anything
            if (currentHouse.isOccupied())
                return;
            //place "house" into the original board
            currentHouse.setOccupied(true);
            //color of rectangle
            currentHouse.getRectangle().setFill(Color.web("#80bfff"));
            //add "house" to stack for easy access when counting neighbors
            currentHouses.add(currentHouse);
        }

        if(e.isSecondaryButtonDown()){
            //if there is no house there, then return
            if(!currentHouse.isOccupied())
                return;
            //take house off board
            currentHouse.setOccupied(false);
            currentHouse.getRectangle().setFill(Color.WHITE);
            //take house out of current houses
            currentHouses.remove(currentHouse);
        }
    }

    //toggle play and pausing the game
    private void playPauseGame(Button buttonPressed){
        if(paused){
            paused = false;
            buttonPressed.setText("Pause");
            //start count neighbors
            playGame();
        }else {
            paused = true;
            buttonPressed.setText(" Play ");
            //pause neighbor count
            timer.cancel();
        }
    }

    //clears board
    private void clearBoard(){
        //make all of board white
        clearBoardOfHouses();
        boardOfNeighbors = new int[110][110];
        //empty the currentHouse stack
        while(!currentHouses.isEmpty()){
            currentHouses.pop();
        }
    }

    //makes entire board unassigned, and white
    private void clearBoardOfHouses(){
        for(int xIndex = 0; xIndex < 110; xIndex++) {
            for (int yIndex = 0; yIndex < 110; yIndex++) {
                House currentHouse = boardOfHouses[xIndex][yIndex];
                currentHouse.setChecked(false);
                currentHouse.setOccupied(false);
                currentHouse.getRectangle().setFill(Color.WHITE);
            }
        }
    }

    //start the game
    private void playGame(){
        //slider value
        long sliderSpeed = Math.round(speedSlider.getValue());
        timer = new Timer();
        //create a task to run in another thread
        TimerTask countNeighbors = new TimerTask() {
            @Override
            public void run() {
                countNeighbors();
                fixBoard();
            }
        };
        timer.scheduleAtFixedRate(countNeighbors, 0, sliderSpeed);
    }

    //goes through the current houses and checks the for their neighbors
    private void countNeighbors(){
        while(!currentHouses.isEmpty()) {
            House currentHouse = currentHouses.pop();
            currentHouse.getRectangle().setFill(Color.WHITE);
            if(!currentHouse.isChecked()){
                countAroundDouble(currentHouse);
            }
        }
    }

    /*
    Neighbor counter takes the first house, and counts a radius of one around it. If it's a house, add one to it's
    number of neighbors. Regardless of if one of the 8 spots is a house or not, count a 1 block radius around that spot
    as well so that we can see if that will become a house.
     */
    private void countAroundDouble(House currentHouse){
        int xCord = currentHouse.getX();
        int yCord = currentHouse.getY();
        int numNeigh = 0;
        for (int y = -1; y <=1; y++){
            for(int x=-1; x<=1; x++){
                House checkingHouse = boardOfHouses[xCord+x][yCord+y];
                if(!checkingHouse.equals(currentHouse)) {
                    if(checkingHouse.isOccupied())
                        numNeigh ++;
                    if(boardOfNeighbors[xCord+x][yCord+y]==0)
                        countAround(xCord+x, yCord+y);
                }
            }
        }
        findNewHouses(numNeigh,xCord,yCord,currentHouse);
    }

    //helper method to count the spots of the counted spots
    private void countAround(int xCord, int yCord){
        House currentHouse = boardOfHouses[xCord][yCord];
        if (currentHouse.isChecked())
            return;
        int numNeigh = 0;
        for (int y = -1; y <=1; y++){
            for(int x=-1; x<=1; x++){
                House checkingHouse = boardOfHouses[xCord+x][yCord+y];
                if(!checkingHouse.equals(currentHouse)) {
                    if (checkingHouse.isOccupied())
                        numNeigh++;
                }
            }
        }
        findNewHouses(numNeigh,xCord,yCord,currentHouse);
    }

    //if the spot fits the criteria to be a house, then add it to a stack of new houses
    private void findNewHouses(int numNeigh, int xCord, int yCord, House house){
        if (numNeigh == 0)
            numNeigh = -1;
        boardOfNeighbors[xCord][yCord] = numNeigh;
        house.setChecked(true);
        checkedHouses.add(house);
        if(numNeigh == 2 || numNeigh == 3) {
            if (house.isOccupied() || numNeigh == 3)
                newHouses.push(house);
        }
    }


    private void fixBoard() {
        //uncheck all houses for next round
        while (!checkedHouses.isEmpty()) {
            House tempHouse = checkedHouses.pop();
            tempHouse.setChecked(false);
            tempHouse.setOccupied(false);
        }
        //transfer all new houses into current houses for next run
        while (!newHouses.isEmpty()) {
            House currentHouse = newHouses.pop();
            //checks if houses are near the edge of board
            if (isValid(currentHouse.getX(), currentHouse.getY())) {
                currentHouse.getRectangle().setFill(Color.web("#80bfff"));
                currentHouses.add(currentHouse);
                currentHouse.setOccupied(true);
            }
        }
        boardOfNeighbors = new int[110][110];
    }

    private boolean isValid(int xCord, int yCord) {
        return !(xCord < 6 || yCord < 6 || yCord > 104 || xCord > 104);
    }
}

//DEBUG USE
            /* Show Matrix After Every Click (put in mousePressed())
                for(int i=0 ;i<boardOfHouses.length; i++){
                    for (int j=0; j<boardOfHouses.length; j++){
                        System.out.print(boardOfHouses[j][i].isOccupied() ? "X ":"O ");
                    }
                    System.out.println();
                }
                System.out.println();
            */

            /* count houses slow
                private int getNeighbors(Coordinate cord){
                    int numNeighbors = 0;
                    int xCord = cord.getX();
                    int yCord = cord.getY();

                    for(int i = 0; i<3; i++){
                        for(int j=0; j<3; j++){
                            if(i == 2 && j ==2)
                                ;
                            else
                                if (board[xCord-1+i][yCord-1+j] == 1)
                                    numNeighbors ++;
                        }
                    }

                    return numNeighbors;
                }
             */

            /* future use for drag feature
                pane.setOnMouseReleased((MouseEvent e)-> {
                        mouseReleased(e);
                        });

                private void mouseReleased(MouseEvent e){
                }
            */

/**
 * Created by Jack on 5/25/2016.
 */
import com.sun.org.apache.regexp.internal.RE;
import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Group;
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
import org.jetbrains.annotations.Contract;
import org.w3c.dom.css.Rect;

import java.util.*;


public class TestBoard extends Application {

    /*Board is 100x100. There is a 10 Block
    buffer zone around the Board.
     */
    private House[][] boardOfHouses = new House[110][110];
    private int[][] boardOfNeighbors = new int[110][110];

    /*Linked List of "Houses" or
    blocks that are filled in
     */
    private Stack<House> currentHouses = new Stack<>();
    //Houses that I've checked so far (for counting)
    private Stack<House> checkedHouses = new Stack<>();
    //houses that will be in the new board;
    private Stack<House> newHouses = new Stack<>();
    //pane is the overall window
    private Pane pane;
    //board is the board of squares
    private Pane board;
    //is game paused
    private boolean paused = true;
    //This is usd for counting neighbors
    Timer timer;

    /*Start App*/
    public static void main(String[] args) {
        launch(args);
    }

    @Override
    public void start(Stage primaryStage) {
    //declare objects needed
        board = new Pane();
        pane = new Pane();
        VBox vb = new VBox();
        HBox hb = new HBox();
        Button playPauseBtn = new Button();
        Button clearBoardBtn = new Button();
        Slider speedSlider = new Slider();

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
            /*NEED TO OPTIMIZE FOR SPACE*/
                if (currentHouse.isOccupied())
                    currentRectangle.setFill(Color.web("#80bfff"));
                else
                    currentRectangle.setFill(Color.WHITE);
                board.getChildren().add(currentRectangle);
            }
        }
    }

    /*NEED TO RENAME LATER
        Upon clicking the mouse on the board,
    */
    private void mousePressed(MouseEvent e) {
        /*NEED TO OPTIMIZE CLASSES (HOUSE & COORDINATE)*/
        //Sets coordinate of mouse click to match x and y cords of the board
            Coordinate mousePos = new Coordinate((int) Math.round(e.getSceneX()), (int) Math.round(e.getSceneY())-77);
        /*MAYBE OPTIMIZE FOR SPACE (USE LESS BOARDS/ DIFFERENT DATA STRUCTURE)*/
        House currentHouse = boardOfHouses[(mousePos.getX()+100)/10][(mousePos.getY()+100)/10];
        if(currentHouse.isOccupied())
            return;
        //place "house" into the original board
            currentHouse.setOccupied(true);
        //color of rectangle
            currentHouse.getRectangle().setFill(Color.web("#80bfff"));
        //add "house" to a queue for easy access when counting neighbors
        currentHouses.add(currentHouse);
    }

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

    private void clearBoard(){
        clearBoardOfHouses();
        boardOfNeighbors = new int[110][110];
        while(!currentHouses.isEmpty()){
            House tempHome = currentHouses.pop();
            tempHome.setRectangleColor(Color.WHITE);
        }
    }

    private void clearBoardOfHouses(){
        for(int xIndex = 0; xIndex < 110; xIndex++) {
            for (int yIndex = 0; yIndex < 110; yIndex++) {
                House currentHouse = boardOfHouses[xIndex][yIndex];
                currentHouse.setChecked(false);
                currentHouse.getRectangle().setFill(Color.WHITE);
            }
        }
    }

    private void playGame(){
        timer = new Timer();
        TimerTask countNeighbors = new TimerTask() {
            @Override
            public void run() {
                countNeighbors();
                fixBoard();
            }
        };
        timer.scheduleAtFixedRate(countNeighbors, 0, 500);
    }

    private void countNeighbors(){
        while(!currentHouses.isEmpty()) {
            House currentHouse = currentHouses.pop();
            currentHouse.getRectangle().setFill(Color.WHITE);
            countAroundDouble(currentHouse);
        }
    }

    private void countAroundDouble(House house){
        if (house.isChecked())
            return;
        int xCord = house.getX();
        int yCord = house.getY();
        int numNeigh = 0;
        for (int y = -1; y <=1; y++){
            for(int x=-1; x<=1; x++){
                House checkingHouse = boardOfHouses[xCord+x][yCord+y];
                if(!checkingHouse.equals(house)) {
                    if(boardOfHouses[xCord+x][yCord+y].isOccupied())
                        numNeigh ++;
                    if(boardOfNeighbors[xCord+x][yCord+y]==0)
                        countAround(xCord+x, yCord+y);
                }
            }
        }
        if (numNeigh == 0)
            numNeigh = -1;
        boardOfNeighbors[xCord][yCord] = numNeigh;
        house.setChecked(true);
        checkedHouses.add(house);
        if(numNeigh == 2 || numNeigh == 3) {
            if (house.isOccupied())
                newHouses.push(house);
            else if (numNeigh == 3)
                newHouses.push(house);
        }
    }

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

        if (numNeigh == 0)
            numNeigh = -1;
        boardOfNeighbors[xCord][yCord] = numNeigh;
        currentHouse.setChecked(true);
        checkedHouses.add(currentHouse);
        if(numNeigh == 2 || numNeigh == 3) {
            if (currentHouse.isOccupied())
                newHouses.push(currentHouse);
            else if (numNeigh == 3)
                newHouses.push(currentHouse);
        }
    }

    private void fixBoard(){
        while(!checkedHouses.isEmpty()){
            House tempHouse = checkedHouses.pop();
            tempHouse.setChecked(false);
            tempHouse.setOccupied(false);
        }
        while(!newHouses.isEmpty()){
            House currentHouse = newHouses.pop();
            currentHouse.getRectangle().setFill(Color.web("#80bfff"));
            currentHouses.add(currentHouse);
            currentHouse.setOccupied(true);
        }
        boardOfNeighbors = new int[110][110];
    }

    private int roundNearestTen(int num){
        return (num/10)*10;
    }
}

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

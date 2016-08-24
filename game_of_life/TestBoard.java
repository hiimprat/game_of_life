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

import java.util.LinkedList;
import java.util.Queue;
import java.util.Stack;


public class TestBoard extends Application {

    /*Board is 100x100. There is a 10 Block
    buffer zone around the Board.
     */
    private int[][] boardOfHouses = new int[110][110];
    private int[][] boardOfNeighbors = new int[110][110];

    /*Linked List of "Houses" or
    blocks that are filled in
     */
    private Stack<House> houses = new Stack<>();
    //pane is the overall window
    private Pane pane;
    //board is the board of squares
    private Pane board;
    //is game paused
    private boolean paused = true;

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
        playPauseBtn.setMinWidth(50);
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
        //HBox currently 68 px tall
        vb.setStyle("-fx-background-color: #00e699;");
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
        primaryStage.setScene(new Scene(pane, 901, 969));

    //show app
        primaryStage.show();
    }

    /* double for loop creating the whole board with lines and blocks*/
    private void drawWholeBoard(){
    //start at 10,10 to only show the middle 100 blocks of the board since there is a 10 block buffer zone around the perimeter
        for (int xCord = 10; xCord < 100; xCord++) {
            for (int yCord = 10; yCord < 100; yCord++) {
            /*NEED TO OPTIMIZE FOR SPACE*/
            //create a rectangle object at that point and fill in it's color
                Rectangle r = new Rectangle(xCord * 10 -99 , yCord * 10 -99, 9, 9);
                if (boardOfHouses[xCord][yCord] == 1)
                    r.setFill(Color.web("#80bfff"));
                else
                    r.setFill(Color.WHITE);
                board.getChildren().add(r);
            }
        }
    }

    /*NEED TO RENAME LATER
        Upon clicking the mouse on the board,
    */
    private void mousePressed(MouseEvent e) {
        /*NEED TO OPTIMIZE CLASSES (HOUSE & COORDINATE)*/
        //Sets coordinate of mouse click to match x and y cords of the board
            Coordinate mousePos = new Coordinate((int) Math.round(e.getSceneX()), (int) Math.round(e.getSceneY())-68);
        /*MAYBE OPTIMIZE FOR SPACE (USE LESS BOARDS/ DIFFERENT DATA STRUCTURE)*/
        //place "house" into the original board
            boardOfHouses[(mousePos.getX()+100)/10][(mousePos.getY()+100)/10] = 1;
        /*OPTIMIZE FOR SPACE*/
        //creates a rectangle with the specified color to place at the perfect corner
            Rectangle r = new Rectangle(roundNearestTen(mousePos.getX()) + 1, roundNearestTen(mousePos.getY()) + 1, 9, 9);
        //color of rectangle
            r.setFill(Color.web("#80bfff"));
        //add "house" to a queue for easy access when counting neighbors
        House newHome = new House(mousePos, r, 0);
        houses.add(newHome);
        //add new rectangle to the board
        board.getChildren().add(newHome.getRectangle());

    }

    private void clearBoard(){
        boardOfHouses = new int[110][110];
        while(!houses.isEmpty()){
            House tempHome = houses.pop();
            tempHome.setRectangleColor(Color.WHITE);
        }
    }

    private void playPauseGame(Button buttonPressed){
        if(paused){
            paused = false;
            buttonPressed.setText("Pause");
        }else {
            paused = true;
            buttonPressed.setText(" Play ");
        }
    }

    private int roundNearestTen(int num){
        return (num/10)*10;
    }
}

            /* Show Matrix After Every Click (put in mousePressed())
                for(int i=0 ;i<boardOfHouses.length; i++){
                    for (int j=0; j<boardOfHouses.length; j++){
                        System.out.print(boardOfHouses[j][i]);
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

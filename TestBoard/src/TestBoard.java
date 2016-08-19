/**
 * Created by Jack on 5/25/2016.
 */
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Rectangle;
import javafx.stage.Stage;
import org.jetbrains.annotations.Contract;

import java.util.LinkedList;
import java.util.Queue;
import java.util.Stack;


public class TestBoard extends Application {

    /*Board is 100x100. There is a 10 Block
    buffer zone around the Board.
     */
    private int[][] board = new int[120][120];
    private int[][] boardOfNeighbors = new int[120][120];

    /*Linked List of "Houses" or
    blocks that are filled in
     */
    private Queue<House> houses = new LinkedList<>();
    private Pane pane;

    /*Start App*/
    public static void main(String[] args) {
        launch(args);
    }

    @Override
    public void start(Stage primaryStage) {
    //title of app
        primaryStage.setTitle("Test Board");
        pane = new Pane();
    //draw the entire board once
        drawWholeBoard();
    //upon clicked do this
        pane.setOnMousePressed((MouseEvent e) -> {
            mousePressed(e);
        });
    //create background
        primaryStage.setScene(new Scene(pane, 1001, 1001, Color.BLACK));
    //show app
        primaryStage.show();
    }

    /* double for loop creating the whole board with lines and blocks*/
    private void drawWholeBoard(){
    //start at 10,10 to only show the middle 100 blocks of the board since there is a 10 block buffer zone around the perimeter
        for (int xCord = 10; xCord < 110; xCord++) {
            for (int yCord = 10; yCord < 110; yCord++) {
            /*NEED TO OPTIMIZE FOR SPACE*/
            //create a rectangle object at that point and fill in it's color
                Rectangle r = new Rectangle(xCord * 10 -99 , yCord * 10 -99, 9, 9);
                if (board[xCord][yCord] == 1)
                    r.setFill(Color.BLUE);
                else
                    r.setFill(Color.WHITE);
                pane.getChildren().add(r);
            }
        }
    }

    /*NEED TO RENAME LATER
        Upon clicking the mouse on the board,
    */
    private void mousePressed(MouseEvent e) {
        /*NEED TO OPTIMIZE CLASSES (HOUSE & COORDINATE)*/
        //Sets coordinate of mouse click to match x and y cords of the board
            Coordinate mousePos = new Coordinate((int) Math.round(e.getSceneX()), (int) Math.round(e.getSceneY()));
        /*MAYBE OPTIMIZE FOR SPACE (USE LESS BOARDS/ DIFFERENT DATA STRUCTURE)*/
        //place "house" into the original board
            board[mousePos.getX()/10][mousePos.getY()/10] = 1;
        //add "house" to a queue for easy access when counting neighbors
            houses.add(new House(mousePos, 0));
        /*OPTIMIZE FOR SPACE*/
        //creates a rectangle with the specified color to place at the perfect corner
            Rectangle r = new Rectangle(roundNearestTen(mousePos.getX()) + 1, roundNearestTen(mousePos.getY()) + 1, 9, 9);
        //color or rectangle
            r.setFill(Color.BLUE);
        //add new rectangle to the board
            pane.getChildren().add(r);
    }


    private int roundNearestTen(int num){
        return (num/10)*10;
    }
}

            /* Show Matrix After Every Click
                for(int i=0 ;i<board.length; i++){
                    for (int j=0; j<board.length; j++){
                        System.out.print(board[j][i]);
                    }
                    System.out.println();
                }
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

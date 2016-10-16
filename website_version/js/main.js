//CONSTANTS
var DEAD_CELL;
var LIVE_CELL;
var DEFAULT_NUM_NEIGH;
var DEFAULT_CELL_LENGTH;
var CHECKED;
var UNCHECKED;
var BOARD_WIDTH_MAX;
var BOARD_HEIGHT_MAX;
var LIVE_COLOR;
var DEAD_COLOR;
var CENTER_OF_CANVAS;

//CANVAS PROPERTIES
var canvas;
var canvas2D;
var canvasWidth;
var canvasHeight;
var currentCordOfCanvas;

//BOARD PROPERTIES
var liveCells;
var currentBoardOfCells;
var numCellsOnBoardWidth;
var numCellsOnBoardHeight;

//CELL PROPERTIES
var cellLength;

/**
 * Initialize the game, assign the constants, start the board, and canvas,
 * start the array of cells, and create the board.
 */
function initGameOfLife() {
    initConstants();
    initCanvas();
    initEventHandlers();
    initArrayOfCells();
    initBoard();
}

/**
 * variables that will be used to run the game
 */
function initConstants() {
    LIVE_CELL = 1;
    DEAD_CELL = 0;
    DEFAULT_NUM_NEIGH = 0;
    DEFAULT_CELL_LENGTH = 8;
    CHECKED = true;
    UNCHECKED = false;
    BOARD_WIDTH_MAX = 1024;
    BOARD_HEIGHT_MAX = 512;
    LIVE_COLOR = "#00e68a";
    DEAD_COLOR = "#4d4d4d";
    CENTER_OF_CANVAS = {
        X: BOARD_WIDTH_MAX / 2,
        Y: BOARD_HEIGHT_MAX / 2
    }
}

/**
 * Initialize the canvas in which the game will be rendered
 */
function initCanvas() {
    // GET THE CANVAS
    canvas = document.getElementById("game_of_life_canvas");

    //DISABLE CONTEXT MENU FOR RIGHT CLICK/DRAG FUNCTION
    canvas.oncontextmenu = disableContextMenu;

    //GET CANVAS2D AND SET THE ORIGIN TO ZERO
    canvas2D = canvas.getContext("2d");
    canvas2D.translate(CENTER_OF_CANVAS.X, CENTER_OF_CANVAS.Y);
    canvas2D.save();
    currentCordOfCanvas = {
        x: CENTER_OF_CANVAS.X,
        y: CENTER_OF_CANVAS.Y
    }

    //SET FONT AND SIZE
    //canvas2D.font = "24px Arial";

    //SET SAME CANVAS SIZE AS ORIGINAL CANVAS
    canvasWidth = canvas.width * DEFAULT_CELL_LENGTH;
    canvasHeight = canvas.height * DEFAULT_CELL_LENGTH;
}

/**
 * Initialize the event handlers to get user feedback
 */
function initEventHandlers() {
    //RESPOND TO MOUSE CLICKS/DRAGS ON THE CANVAS, GET THE TYPE OF CLICK
    canvas.onmousedown = handleMouseEvents;

    //RESPOND TO MOUSE WHEEL FOR ZOOMING IN OUT OF BOARD
    canvas.onmousewheel = handleMouseWheelEvent;
}

/**
 * Setup the two boards that we will use to render the game
 */
function initArrayOfCells() {
    currentBoardOfCells = new Array();
    cellLength = DEFAULT_CELL_LENGTH;
    numCellsOnBoardWidth = BOARD_WIDTH_MAX / cellLength;
    numCellsOnBoardHeight = BOARD_HEIGHT_MAX / cellLength;

    //CREATE 2-D ARRAY FOR BOARD
    for (xIndex = 0; xIndex < BOARD_WIDTH_MAX; xIndex++) {
        currentBoardOfCells[xIndex] = new Array();
        for (yIndex = 0; yIndex < BOARD_HEIGHT_MAX; yIndex++) {

            //CREATE THE CELL THAT IS PLACED INTO THE ARRAY
            var cell = initCells(xIndex, yIndex);
            currentBoardOfCells[xIndex][yIndex] = cell;
        }
    }
}

/**
 * Create cell objects so we only have to use one two datastructures and render
 * board in a quick way
 */
function initCells(x, y) {
    return {
        isDead: DEAD_CELL,
        isChecked: UNCHECKED,

        //VISUAL COORDS ARE NOT INIALIZED YET
        visualXCord: -1,
        visualYCord: -1,
        actualXCord: x,
        actualYCord: y
    };
}

/**
 * Creates a stack for live cells
 */
function initBoard() {
    liveCells = [];
}

/**
 * Handles the clicks and drags on canvas. Calls functions
 * based on mouse button and drag or click
 */
function handleMouseEvents(event) {
    // 'event.which' RETURNS 1, 2, OP 3 FOR LEFT, MIDDLE, OR RIGHT MOUSE RESPECTIVELY
    switch (event.which) {

        //HANDLE LEFT CLICK AND DRAG
        //LEFT CLICK /DRAG WILL CREATE LIVE CELLS OR KILL LIVE CELLS BASED ON A TOGGLE
        case 1:
            handleLeftMouseDrag(event);
            handleLeftMouseClick(event);
            break;

            // HANDLE MIDDLE CLICK
            // DOES NOTHING AS OF NOW
        case 2:
            handleMiddleMouseClick(event);
            break;

            //HANDLE RIGHT CLICK AND DRAG
            //TRANSLATES BOARD IF BOARD IS NOT ALREADY MAX SIZE
        case 3:
            event.ondrag = handleRightMouseDrag(event);
            break;
        default:
            alert('You have a strange Mouse!');
    }
}

/**
 * Handle the mouse scrolling for zooming in and out
 */
function handleMouseWheelEvent(event) {
    console.log("Zoon");
}

/**
 * Disable the context menu on the canvas
 */
function disableContextMenu(event) {
    return false;
}

/**
 * CREATE OR KILL A CELL
 */
function handleLeftMouseClick(event) {
    //RESTORES CURRENT CENTER INCASE OF CHANGE FROM RIGHT CLICK DRAG
    setCanvasCenter(currentCordOfCanvas.x, currentCordOfCanvas.y);

    // GET THE COORS OF CLICK
    var canvasCoords = getRelativeCoords(event);
    var xClickRounded = Math.round(canvasCoords.x);
    var yClickRounded = Math.round(canvasCoords.y);

    //GET THE ACTUAL COORDINATE TO PUT INTO THE ARRAY FOR FINDING NEIGHBORS
    var roundedCord = roundOffCord(xClickRounded, yClickRounded);
    var actualCord = findActualCord(roundedCord);
    var currentCell = currentBoardOfCells[actualCord.x][actualCord.y];
    currentCell.actualXCord = actualCord.x;
    currentCell.actualYCord = actualCord.y;

    //I CAN GET THIS LATER FOR RENDERING THE RECTANGLE
    var visualCord = findVisualCord(canvasCoords);
    currentCell.visualXCord = visualCord.x;
    currentCell.visualYCord = visualCord.y;

    //TELL SHOW THAT THE CELL IS ALIVE
    currentCell.isDead = LIVE_CELL;

    console.log(currentCell.actualXCord, currentCell.actualYCord);

    //ADD THE CELLS TO A LIVE CELL ARRAY
    liveCells.push(currentCell);

    //RENDER THE CELL
    renderCell(currentCell.visualXCord, currentCell.visualYCord, LIVE_COLOR);
}

/**
 *  CREATE OR KILL MULTIPLE CELLS
 */
function handleLeftMouseDrag(event) {
    //WHEN MOUSE MOVES, DRAW OR KILL CELLS
    canvas.onmousemove = handleLeftMouseClick;

    //WHEN IT RELEASES, THEN STOP HANDLING
    canvas.onmouseup = function() {
        canvas.onmousemove = null;
    }
}

/**
 * DOES NOTHING FOR NOW
 */
function handleMiddleMouseClick(event) {
    console.log("middleClicked");
}

//ORIGINAL CORDS OR MOUSE CLICK FOR FINDING OUT HOW MUCH WE TRANSLATED DURING
//RIGHT MOUSE DRAG
var startClickX;
var startClickY;
var finalClickX;
var finalClickY;
var movementLimitedX = false;
var movementLimitedY = false;

/**
 * MOVES THE BOARD IF NOT MAX SIZED
 */
function handleRightMouseDrag(event) {
    //GET STARTING COORDINATE OF MOUSE
    var startCanvasCord = getRelativeCoords(event);
    startClickX = Math.round(startCanvasCord.x);
    startClickY = Math.round(startCanvasCord.y);

    var finalCanvasCords = getRelativeCoords(event);
    finalClickX = Math.round(finalCanvasCords.x);
    finalClickY = Math.round(finalCanvasCords.y);

    //IF IT MOVES WHILE MOUSE IS DOWN, START HANDLING DRAG
    canvas.onmousemove = helperHandleMouseDrag;

    //STOP HANDLING DRAG IF MOUSE RELEASES
    canvas.onmouseup = function() {
        canvas.onmousemove = null;

        //PUT THE CANVAS ORIGIN TO WHERE I FINISHED DRAGGING IF
        //I AM ALLOWED TO DRAG IT THERE
        var translateAmount = calcTranslateAmount({x:finalClickX - startClickX, y:finalClickY - startClickY});
        translateCanvasCenter(translateAmount.x, translateAmount.y);
    }
}

/**
 * For each position the user drags to, get the new coordinates of it, and
 * translate the rendered board to the amount the user drags
 */
function helperHandleMouseDrag(event) {
    //GET NEW COORDINATE OF MOUSE
    var finalCanvasCords = getRelativeCoords(event);
    finalClickX = Math.round(finalCanvasCords.x);
    finalClickY = Math.round(finalCanvasCords.y);

    //CLEAR THE CURRENT CANVAS BC CAN'T ACCESS CHILDREN WITH CANVAS
    //AS THE CELL LENGTH BECOMES LARGER, WE NEED TO CLEAR A BIGGER BOARD
    canvas2D.clearRect(-(canvasWidth / 2), -(canvasHeight / 2), canvasWidth, canvasHeight);

    //FOR EVERY LIVE CELL, RE-RENDER IT
    for (index = 0; index < liveCells.length; index++) {
        //GET CURRENT VISUAL CORD OF CELL
        var currentCell = liveCells[index];
        var xCurrentCell = currentCell.visualXCord;
        var yCurrentCell = currentCell.visualYCord;

        //FIND THE DISTANCE BETWEEN ORIGINAL MOUSE CLICK AND NEW MOUSE CLICK
        var newX = Math.round(finalClickX - startClickX);
        var newY = Math.round(finalClickY - startClickY);

        //ROUND IT SO THAT IT TRANSLATES IN A NICE WAY WITH RESPECT
        //TO THE CURRENT BOARD AND SIZE OF CELLS
        var fixedCord = roundOffCord(newX, newY);

        //MOVE THE CANVAS TO IT'S ORIGINAL POSITION
        setCanvasCenter(currentCordOfCanvas.x, currentCordOfCanvas.y);

        //CHECK TO SEE IF I CAN MOVE THE CANVAS
        checkLimitedMovement(fixedCord);

        //FIND THE AMOUNT TO TRANSLATE THE CANVAS BASED ON THE LIMITED
        //MOVEMENTS OF THE USER
        var translateAmount = calcTranslateAmount(fixedCord);

        //MOVE THE CANVAS TO THE NEW POSITION TO MOVE CELLS IF IM NOT NEAR THE EDGE
        canvas2D.translate(translateAmount.x, translateAmount.y);

        //REDRAW THE CELLS IN THE SAME PLACE, BUT AFTER THE CANVAS IS MOVED
        renderCell(xCurrentCell, yCurrentCell, LIVE_COLOR);
    }
}

/**
 * THE AMOUNT I TRANSLATE MY POINT BASED ON THE LIMITED MOVEMENT
 */
function calcTranslateAmount(cord){
  //IF BOTH LIMITED, DONT SHIFT
  if (movementLimitedX && movementLimitedY) {
    cord.x = 0;
    cord.y = 0;
  } else
  //IF X LIMITED, ONLY CHANGE Y
  if (movementLimitedX) {
      cord.x = 0;
  } else
  //IF Y LIMITED, CHANGE ONLY X
  if (movementLimitedY) {
      cord.y = 0;
  }
  return cord;
}

/**
 * CHECK BOTH X AND Y TO SEE IF IT'S LIMITED IN EITHER WAY
 */
function checkLimitedMovement(cord){
  checkLimitedMovementX(cord);
  checkLimitedMovementY(cord);
}

/**
 * check if the user can scroll in the X direction
 */
function checkLimitedMovementX(distanceTraveledByCenter) {
    //GETS NUM OF CELLS FROM THE CENTER OF MY PHYSICAL CANVAS TO THE POINT OF THE ACTUAL CANVAS
    var numCellsAwayFromCenter = (currentCordOfCanvas.x + distanceTraveledByCenter.x - CENTER_OF_CANVAS.X) / cellLength;
    if (Math.abs(numCellsAwayFromCenter) >= 448) {
        if (numCellsAwayFromCenter > 0) {
            setCanvasCenter(4096, currentCordOfCanvas.y);
        } else {
            setCanvasCenter(-3072, currentCordOfCanvas.y);
        }
        movementLimitedX = true;
    } else {
        movementLimitedX = false;
    }
}

/**
 * check if the user can scroll in the Y direction
 */
function checkLimitedMovementY(distanceTraveledByCenter) {
    //GETS NUM OF CELLS FROM THE CENTER OF MY PHYSICAL CANVAS TO THE POINT OF THE ACTUAL CANVAS
    var numCellsAwayFromCenter = (currentCordOfCanvas.y + distanceTraveledByCenter.y - CENTER_OF_CANVAS.Y) / cellLength;
    if (Math.abs(numCellsAwayFromCenter) >= 224) {
        if (numCellsAwayFromCenter > 0) {
            setCanvasCenter(currentCordOfCanvas.x, 2048);
        } else {
            setCanvasCenter(currentCordOfCanvas.x, -1536);
        }
        movementLimitedY = true;
    } else {
        movementLimitedY = false;
    }
}

/**
 * Set the canvas center position
 */
function translateCanvasCenter(xCord, yCord) {
    var roundedCoord = roundOffCord(xCord, yCord)
    currentCordOfCanvas.x = currentCordOfCanvas.x + roundedCoord.x;
    currentCordOfCanvas.y = currentCordOfCanvas.y + roundedCoord.y;
    canvas2D.translate(roundedCoord.x, roundedCoord.y);
    canvas2D.save();
}

/**
 * Hack for restoring current center of canvas since save() and restore()
 * does not work over new calls
 */
function setCanvasCenter(x, y) {
    canvas2D.setTransform(1, 0, 0, 1, 0, 0);
    canvas2D.translate(x, y);
    currentCordOfCanvas.x = x;
    currentCordOfCanvas.y = y;
}

/**
 * Get relative coord of mouse where 0,0 is the top left corner of the canvas
 */
function getRelativeCoords(event) {
    var canvasOffset = $("#game_of_life_canvas").offset();
    var offsetX = canvasOffset.left;
    var offsetY = canvasOffset.top;
    return {
        x: event.clientX - offsetX,
        y: event.clientY - offsetY
    };
}

/**
 * Render the current cell;
 */
function renderCell(xCord, yCord, color) {
    var cord = roundOffCord(xCord, yCord);

    canvas2D.fillStyle = color;
    canvas2D.fillRect(cord.x, cord.y, cellLength, cellLength);
}

/**
 * round off the cell's x and y cords based on the cell length to assure for a
 * flush canvas
 */
function roundOffCord(xCord, yCord) {
    var xRemains = xCord % cellLength;
    var yRemains = yCord % cellLength;

    //JS DOES NOT MODULUS CORRECTLY, MUST PROVIDE SELF FIX FOR MODULUS NEG NUM
    if (xCord < 0) {
        xRemains = cellLength + xRemains;
    }
    if (yCord < 0) {
        yRemains = cellLength + yRemains;
    }

    return {
        x: xCord - xRemains,
        y: yCord - yRemains
    }
}

/**
 * get the actual coordinates to put into the array
 */
function findActualCord(roundedCord) {
    //GET THE NUM CELLS FROM THE CENTER OF THE CANVAS
    var numXCellsFromCenter = ((roundedCord.x - currentCordOfCanvas.x) / cellLength);
    var numYCellsFromCenter = ((roundedCord.y - currentCordOfCanvas.y) / cellLength);

    //GET THE ACTUAL COORDS TO PUT INTO THE ARRAY
    return {
        x: CENTER_OF_CANVAS.X + numXCellsFromCenter,
        y: CENTER_OF_CANVAS.Y + numYCellsFromCenter
    }
}

/**
 * find the visual coordinate of the object
 */
function findVisualCord(roundedCanvasCord) {
    return {
        x: roundedCanvasCord.x - currentCordOfCanvas.x,
        y: roundedCanvasCord.y - currentCordOfCanvas.y
    }
}

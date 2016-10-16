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

//CANVAS PROPERTIES
var canvas;
var canvas2D;
var canvasWidth;
var canvasHeight;

//BOARD PROPERTIES
var liveCells;
var currentBoardOfCells;
var numCellsOnBoardWidth;
var numCellsOnBoardHeight;

//CELL PROPERTIES
var cellLength;

/**
 * Initialize the game
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
}

/**
 * Initialize the canvas in which the game will be rendered
 */
function initCanvas() {
    // GET THE CANVAS
    canvas = document.getElementById("game_of_life_canvas");

    //DISABLE CONTEXT MENU FOR RIGHT CLICK/DRAG FUNCTION
    canvas.oncontextmenu = disableContextMenu;

    //GET CANVAS2D
    canvas2D = canvas.getContext("2d");

    //SET FONT AND SIZE
    //canvas2D.font = "24px Arial";

    //SET SAME CANVAS SIZE AS ORIGINAL CANVAS
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
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

    //CREATE 2-D ARRAY FOR EACH BOARD
    for (xIndex = 0; xIndex < BOARD_WIDTH_MAX; xIndex++) {
        currentBoardOfCells[xIndex] = new Array();
        for (yIndex = 0; yIndex < BOARD_HEIGHT_MAX; yIndex++) {

            //CREATE THE CELL THAT IS PLACED INTO THE ARRAY
            var cell = initCells(xIndex,yIndex);
            currentBoardOfCells[xIndex][yIndex] = cell;
        }
    }
}

/**
 * Create cell objects so we only have to use one two datastructures and render
 * board in a quick way
 */
function initCells(x,y) {
    return {
        isDead: DEAD_CELL,
        isChecked: UNCHECKED,
        visualXCord:x,
        visualYCord:y,
        actualXCord:x,
        actualYCord:y
    };
}

/**
 * create the first rendering of the board
 */
function initBoard() {
    liveCells = [];
    canvas2D.fillStyle = DEAD_COLOR;
    for (xIndex = 0; xIndex < numCellsOnBoardWidth; xIndex++) {
        for (yIndex = 0; yIndex < numCellsOnBoardHeight; yIndex++) {
            var x = xIndex * cellLength;
            var y = yIndex * cellLength;
            canvas2D.fillRect(x, y, cellLength, cellLength);
        }
    }
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
    // CALCULATE THE ROW,COL OF THE CLICK
    var canvasCoords = getRelativeCoords(event);
    var clickX = Math.round(canvasCoords.x);
    var clickY = Math.round(canvasCoords.y);
    var roundedCord = roundOffCord(clickX,clickY);
    var actualCord = findActualCord(roundedCord);
    var currentCell = currentBoardOfCells[actualCord.x][actualCord.y];
    currentCell.actualXCord=actualCord.x;
    currentCell.actualYCord=actualCord.y;
    currentCell.visualXCord=clickX;
    currentCell.visualYCord=clickY;
    console.log(currentCell);
    currentCell.isDead = LIVE_CELL;
    liveCells.push(currentCell);

    renderCell(clickX,clickY,LIVE_COLOR);
}

/**
 *  CREATE OR KILL MULTIPLE CELLS
 */
function handleLeftMouseDrag(event) {
    canvas.onmousemove = handleLeftMouseClick;
    canvas.onmouseup = function(){
      canvas.onmousemove = null;
    }
}

/**
 * DOES NOTHING FOR NOW
 */
function handleMiddleMouseClick(event) {
    console.log("middleClicked");
}

//ORIGINAL CORDS FOR FINDING OUT HOW MUCH WE TRANSLATED
var startClickX;
var startClickY;

/**
 * MOVES THE BOARD IF NOT MAX SIZED
 */
function handleRightMouseDrag(event) {
  var startCanvasCord = getRelativeCoords(event);
  startClickX = Math.round(startCanvasCord.x);
  startClickY = Math.round(startCanvasCord.y);
  canvas.onmousemove = helperHandleMouseDrag;
  canvas.onmouseup = function(){
    canvas.onmousemove = null;
    canvas2D.setTransform(1,0,0,1,0,0);
  }
}

function helperHandleMouseDrag(event){
  var finalCanvasCords = getRelativeCoords(event);
  var finalClickX = Math.round(finalCanvasCords.x);
  var finalClickY = Math.round(finalCanvasCords.y);

  canvas2D.clearRect(0,0,canvasWidth,canvasHeight);


  for(index = 0; index<liveCells.length; index++){
    var currentCell = liveCells[index];
    var xCurrentCell = currentCell.visualXCord;
    var yCurrentCell = currentCell.visualYCord;

    var newX = Math.round(finalClickX-startClickX);
    var newY = Math.round(finalClickY-startClickY);

    var fixedCord = roundOffCord(newX,newY);

    canvas2D.setTransform(1,0,0,1,0,0);
    canvas2D.translate(fixedCord.xFixed,fixedCord.yFixed);
    renderCell(xCurrentCell,yCurrentCell,LIVE_COLOR);
  }
}


/**
 * Get relative coord of mouse where 0,0 is the top left corner of the canvas
 */
function getRelativeCoords(event){
    if (event.offsetX !== undefined && event.offsetY !== undefined)
    {
        return { x: event.offsetX, y: event.offsetY };
    }
    else
    {
        return { x: event.layerX, y: event.layerY };
    }
}

/**
 * Render the current cell;
 */
function renderCell(xCord, yCord, color){
  var cord = roundOffCord(xCord,yCord);

  canvas2D.fillStyle = color;
  canvas2D.fillRect(cord.xFixed,cord.yFixed,cellLength,cellLength);
}

function roundOffCord(xCord, yCord){
  var xRemains = xCord % cellLength;
  var yRemains = yCord % cellLength;
  return {
    xFixed: xCord-xRemains,
    yFixed: yCord-yRemains
  }
}

function findActualCord(roundedCord){
  return {
    x: roundedCord.xFixed/cellLength,
    y: roundedCord.yFixed/cellLength
  }
}

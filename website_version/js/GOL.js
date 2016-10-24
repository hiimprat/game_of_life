//CONSTANTS
var DEAD_CELL;
var LIVE_CELL;
var DEFAULT_NUM_NEIGH;
var DEFAULT_CELL_LENGTH;
var MAX_CELL_LENGTH;
var MIN_CELL_LENGTH;
var CELL_MULTIPLYER;
var CHECKED;
var UNCHECKED;
var BOARD_WIDTH_MAX;
var BOARD_HEIGHT_MAX;
var LIVE_COLOR;
var DEAD_COLOR;
var CENTER_OF_CANVAS;
var DRAW_MODE;
var ERASE_MODE;
var DRAG_MODE;
var ZOOM_IN_MODE;
var ZOOM_OUT_MODE;
var DEFAULT_FPS;
var MILLISECONDS_IN_ONE_SECOND;
var PAUSED;
var UNPAUSED;

//CANVAS PROPERTIES
var canvas;
var canvas2D;
var canvasWidth;
var canvasHeight;
var currentCordOfCanvas;

//BOARD PROPERTIES
var liveCells;
var newLiveCells;
var checkedCells;
var currentBoardOfCells;
var numCellsOnBoardWidth;
var numCellsOnBoardHeight;

//CELL PROPERTIES
var cellLength;

//timer for each cycle of game
var timer;
var currentFPS;
var paused;

//inputs
var speedSlider;
var leftMouseProperty;

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
    MAX_CELL_LENGTH = 32;
    MIN_CELL_LENGTH = 1;
    CELL_MULTIPLYER = 2;
    CHECKED = true;
    UNCHECKED = false;
    BOARD_WIDTH_MAX = 1024;
    BOARD_HEIGHT_MAX = 512;
    LIVE_COLOR = "#cc0000";
    DEAD_COLOR = "#A9A9A9";
    CENTER_OF_CANVAS = {
        X: BOARD_WIDTH_MAX / 2,
        Y: BOARD_HEIGHT_MAX / 2
    }
    DRAW_MODE = "DRAW_MODE";
    ERASE_MODE = "ERASE_MODE";
    DRAG_MODE = "DRAG_MODE";
    ZOOM_IN_MODE = "ZOOM_IN_MODE";
    ZOOM_OUT_MODE = "ZOOM_OUT_MODE";
    DEFAULT_FPS = 15;
    MILLISECONDS_IN_ONE_SECOND = 1000;
    PAUSED = "PAUSED";
    UNPAUSED = "UNPAUSED";

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
    //INITIALIZE ALL DIABLED BUTTONS
    $('#pause_button').prop('disabled', true);
    $('#reset_button').prop('disabled', true);

    //SET THE INITAL PROPERTY OF MOUSE
    leftMouseProperty = DRAW_MODE;

    //START THE SLIDER
    initSpeedSlider();

    //RESPOND TO MOUSE CLICKS/DRAGS ON THE CANVAS, GET THE TYPE OF CLICK
    canvas.onmousedown = handleMouseEvents;

    //RESPOND TO MOUSE WHEEL FOR ZOOMING IN OUT OF BOARD
    if (canvas.addEventListener) {
        //IE9, Chrome, Safari, Opera
        canvas.addEventListener("mousewheel", handleMouseWheelEvent, false);
        // Firefox
        canvas.addEventListener("DOMMouseScroll", handleMouseWheelEvent, false);
    }
    // IE 6/7/8
    else canvas.attachEvent("onmousewheel", handleMouseWheelEvent);

    //RESPOND TO BUTTON CLICKS
    document.getElementById("start_button").onclick = handleStartButton;
    document.getElementById("pause_button").onclick = handlePauseButton;
    document.getElementById("reset_button").onclick = handleResetButton;
    document.getElementById("draw_button").onclick = setDrawOn;
    document.getElementById("erase_button").onclick = setEraseOn;
    document.getElementById("drag_button").onclick = setDragOn;
    document.getElementById("zoom_in_button").onclick = setZoomIn;
    document.getElementById("zoom_out_button").onclick = setZoomOut;
    document.getElementById("speed_down_slider").onclick = handleSpeedDown;
    document.getElementById("speed_up_slider").onclick = handleSpeedUp;

    //RESPOND TO SLIDER MOVEMENT
    speedSlider.on("slide", handleSliderEvent);
}

/**
 * initializer the slider that will change the FPS of the simulation
 */
function initSpeedSlider() {
    speedSlider = new Slider("#speed_slider");
    currentFPS = DEFAULT_FPS;
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
    for (var xIndex = 0; xIndex < BOARD_WIDTH_MAX; xIndex++) {
        currentBoardOfCells[xIndex] = new Array();
        for (var yIndex = 0; yIndex < BOARD_HEIGHT_MAX; yIndex++) {

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
        numNeigh: DEFAULT_NUM_NEIGH,
        x: x,
        y: y
    };
}

/**
 * Creates a stack for live cells
 */
function initBoard() {
    liveCells = [];
    newLiveCells = [];
    checkedCells = [];
}

/**
 * handles the start, pause, and reset button clicks.
 * sets buttons to their respective disabled states
 * hides the tooltips of the buttons once disabled
 * performs the option the user selected (start, pause, reset)
 */
function handleStartButton() {
    paused = UNPAUSED;
    $('#start_button').prop('disabled', true);
    $('#start_button').tooltip('hide');
    $('#pause_button').prop('disabled', false);
    startGameOfLife();
}

function handlePauseButton() {
    paused = PAUSED;
    $('#pause_button').prop('disabled', true);
    $('#pause_button').tooltip('hide');
    $('#start_button').prop('disabled', false);
    pauseGameOfLife();
}

function handleResetButton() {
    puased= PAUSED;
    $('#reset_button').prop('disabled', true);
    $('#reset_button').tooltip('hide');
    $('#pause_button').prop('disabled', true);
    $('#start_button').prop('disabled', false);
    resetGameOfLife();
    pauseGameOfLife();
}

/**
 * Set the current state of the mouse to be drawing
 */
function setDrawOn() {
    leftMouseProperty = DRAW_MODE;
}

/**
 * Set the current state of the mouse to be erasing
 */
function setEraseOn() {
    leftMouseProperty = ERASE_MODE;
}

/**
 * Set the current state of the mouse to be dragging
 */
function setDragOn() {
    leftMouseProperty = DRAG_MODE;
}

/**
 * set Current state of mouse to be zoomIn
 */
function setZoomIn() {
    leftMouseProperty = ZOOM_IN_MODE;
}

/**
 * set current state of mouse to be zoomOut
 */
function setZoomOut() {
    leftMouseProperty = ZOOM_OUT_MODE;
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
 * handle the slider event, in this case, change the FPS and update the span
 * holding the value for the slider FPS
 */
function handleSliderEvent() {
    //get current FPS
    currentFPS = speedSlider.getValue();

    //update html
    document.getElementById("speed_slider_value").innerHTML = currentFPS;

    //disable button if cannot slow down or speed up further
    if (currentFPS == 1) {
        $('#speed_down_slider').prop('disabled', true);
    }else{
      $('#speed_down_slider').prop('disabled', false);
    }
    if (currentFPS == 30) {
        $('#speed_up_slider').prop('disabled', true);
    }else{
      $('#speed_up_slider').prop('disabled', false);
    }

    //change the fps of the board
    changeFPS();
}

/**
 * handle speeding up and slowing down of button clicks
 */
function handleSpeedDown() {
    //slow it down by 1
    currentFPS = speedSlider.getValue() - 1;

    //update slider
    speedSlider.setValue(currentFPS);

    //update html
    document.getElementById("speed_slider_value").innerHTML = currentFPS;

    //update board
    changeFPS();
}

function handleSpeedUp() {
    currentFPS = speedSlider.getValue() + 1;
    speedSlider.setValue(currentFPS);
    document.getElementById("speed_slider_value").innerHTML = currentFPS;
    changeFPS();
}

/**
 * Handle the mouse scrolling for zooming in and out
 */
function handleMouseWheelEvent(e) {
    e.preventDefault();
    //GET MOUSE AND CORD BEFORE ZOOM SO WE CAN DETECH WICH CELL TO ZOOM IN ON
    //GET CURRENT PLACE OF MOUSE AND ROUND IT.
    var canvasCoords = getRelativeCoords(event);
    var xClickRounded = Math.round(canvasCoords.x);
    var yClickRounded = Math.round(canvasCoords.y);

    //ROUND NEW CORD TO MATCH THE CELL LENGTH AND WIDTH THEN GET
    //THE ACTUAL CORD OF CELL
    var roundedCord = roundOffCord(xClickRounded, yClickRounded);
    var actualCord = findActualCord(roundedCord);

    // cross-browser wheel delta
    var e = window.event || e; // old IE support

    //FIND CHANGE IN MOUSE
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

    //ZOOM AND GET RESULT (FALSE IF DID NOT ZOOM BC ALREADY MAXED)
    if (delta > 0) {
        zoomIn(actualCord);
    } else {
        zoomOut(actualCord);
    }
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
    //enable reset button once board is updated
    $('#reset_button').prop('disabled', false);

    //check for if user selected dragging
    if (leftMouseProperty == DRAG_MODE) {
        handleRightMouseDrag(event);
        return;
    }

    // GET THE COORS OF CLICK
    var canvasCoords = getRelativeCoords(event);
    var xClickRounded = Math.round(canvasCoords.x);
    var yClickRounded = Math.round(canvasCoords.y);

    //GET THE ACTUAL COORDINATE TO PUT INTO THE ARRAY FOR FINDING NEIGHBORS
    var roundedCord = roundOffCord(xClickRounded, yClickRounded);
    var actualCord = findActualCord(roundedCord);

    //CHECK FOR IF USER REQUESTED ZOOMING IN / OUT
    if (leftMouseProperty == ZOOM_IN_MODE) {
        zoomIn(actualCord);
        return;
    }

    if (leftMouseProperty == ZOOM_OUT_MODE) {
        zoomOut(actualCord);
        return;
    }

    //IF NOT THEN DRAW OR ERASE CELL
    var currentCell = currentBoardOfCells[actualCord.x][actualCord.y];

    //if user wants to draw:
    if (leftMouseProperty == DRAW_MODE) {
        //if the cell is dead make it live
        console.log(currentCell.isDead);
        if (currentCell.isDead == DEAD_CELL) {
            currentCell.isDead = LIVE_CELL;

            //ADD THE CELLS TO A LIVE CELL ARRAY FOR QUICK NEIGHBOR PROCESSESING
            liveCells.push(currentCell);

            //RENDER THE CELL
            renderCell(currentCell.x, currentCell.y, LIVE_COLOR);
        }
        //if user wants to erase
    } else {
        //if the cell is alive, kill it
        if (currentCell.isDead == LIVE_CELL) {
            currentCell.isDead = DEAD_CELL;
            
            //remove it from array of live cells
            removeFromLiveCells(currentCell);

            //render it dead
            renderCell(currentCell.x, currentCell.y, DEAD_COLOR);
        }
    }

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

//FIXME ORIGINAL CORDS OR MOUSE CLICK FOR FINDING OUT HOW MUCH WE TRANSLATED DURING
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

    //GET THE ENDING POINT OF THE MOUSE IN CASE DRAG HAS NOT HAPPENEND
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
        var translateAmount = calcTranslateAmount({
            x: finalClickX - startClickX,
            y: finalClickY - startClickY
        });
        setCanvasCenter(currentCordOfCanvas.x, currentCordOfCanvas.y);
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
    clearCanvas();

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

    //RENDER ALL CELLS
    renderAllCells();
}

/**
 * THE AMOUNT I TRANSLATE MY POINT BASED ON THE LIMITED MOVEMENT
 */
function calcTranslateAmount(cord) {
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
function checkLimitedMovement(cord) {
    checkLimitedMovementX(cord);
    checkLimitedMovementY(cord);
}

/**
 * check if the user can scroll in the X direction
 */
function checkLimitedMovementX(distanceTraveledByCenter) {
    //GETS NUM OF CELLS FROM THE CENTER OF MY PHYSICAL CANVAS TO THE POINT OF THE ACTUAL CANVAS
    var numCellsAwayFromCenter = (currentCordOfCanvas.x + distanceTraveledByCenter.x - CENTER_OF_CANVAS.X) / cellLength;

    //MAX NUM CELLS AWAY FROM CENTER
    var maxCellsAwayFromCenter = (canvasWidth / 2 - CENTER_OF_CANVAS.X) / cellLength;
    if (Math.abs(numCellsAwayFromCenter) >= maxCellsAwayFromCenter) {

        //SETS THE MAX/ MIN POSSIBLE CORRDINATE BASED ON THE GIVEN LENGTH OF A CELL
        if (numCellsAwayFromCenter > 0) {
            setCanvasCenter(maxCellsAwayFromCenter * cellLength + CENTER_OF_CANVAS.X, currentCordOfCanvas.y);
        } else {
            setCanvasCenter(CENTER_OF_CANVAS.X - maxCellsAwayFromCenter * cellLength, currentCordOfCanvas.y);
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

    //MAX NUM CELLS AWAY FROM CENTER
    var maxCellsAwayFromCenter = (canvasHeight / 2 - CENTER_OF_CANVAS.Y) / cellLength;

    //SETS THE MAX/ MIN POSSIBLE CORRDINATE BASED ON THE GIVEN LENGTH OF A CELL
    if (Math.abs(numCellsAwayFromCenter) >= maxCellsAwayFromCenter) {
        if (numCellsAwayFromCenter > 0) {
            setCanvasCenter(currentCordOfCanvas.x, maxCellsAwayFromCenter * cellLength + CENTER_OF_CANVAS.Y);
        } else {
            setCanvasCenter(currentCordOfCanvas.x, CENTER_OF_CANVAS.Y - maxCellsAwayFromCenter * cellLength);
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
    var scrollTop = $(window).scrollTop();
    return {
        x: event.clientX - offsetX,
        y: event.clientY + scrollTop - offsetY
    };
}

/**
 * Render the current cell
 */
function renderCell(xCord, yCord, color) {
    xCord = (xCord - CENTER_OF_CANVAS.X) * (cellLength);
    yCord = (yCord - CENTER_OF_CANVAS.Y) * (cellLength);

    canvas2D.fillStyle = color;
    canvas2D.fillRect(xCord, yCord, cellLength, cellLength);
}

/**
 * Render all live cells
 */
function renderAllCells() {
    clearCanvas();
    for (var index = 0; index < liveCells.length; index++) {
        //GET CURRENT CORD OF CELL
        var currentCell = liveCells[index];
        var xCurrentCell = currentCell.x;
        var yCurrentCell = currentCell.y;
        renderCell(xCurrentCell, yCurrentCell, LIVE_COLOR);
    }
}

/**
 * remove a given cell from the array of live cells
 */
function removeFromLiveCells(cell) {
    var index = liveCells.indexOf(cell);
    if (index > -1) {
        liveCells.splice(index, 1);
    }
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

    //RETURN NOW ROUNDED CORRDS
    var roundedX = xCord - xRemains;
    var roundedY = yCord - yRemains;
    return {
        x: roundedX,
        y: roundedY
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
 * change the cell length and everything affected by it's length
 */
function increaseCellLength() {
    if (cellLength != MAX_CELL_LENGTH) {
        cellLength = cellLength * CELL_MULTIPLYER;
        canvasWidth = canvasWidth * CELL_MULTIPLYER;
        canvasHeight = canvasHeight * CELL_MULTIPLYER;
        numCellsOnBoardWidth = numCellsOnBoardWidth / CELL_MULTIPLYER;
        numCellsOnBoardHeight = numCellsOnBoardHeight / CELL_MULTIPLYER;
        return true;
    }
    return false;
}

function decreaseCellLength() {
    if (cellLength != MIN_CELL_LENGTH) {
        cellLength = cellLength / CELL_MULTIPLYER;
        canvasWidth = canvasWidth / CELL_MULTIPLYER;
        canvasHeight = canvasHeight / CELL_MULTIPLYER;
        numCellsOnBoardWidth = numCellsOnBoardWidth * CELL_MULTIPLYER;
        numCellsOnBoardHeight = numCellsOnBoardHeight * CELL_MULTIPLYER;
        return true;
    }
    return false;
}

/**
 * zoom in to current location of mouse
 */
function zoomIn(actualCord) {
    var zoomed = increaseCellLength();
    zoomInOutHelper(zoomed, actualCord);
}

/**
 * zoom out to from current location of mouse
 */
function zoomOut(actualCord) {
    var zoomed = decreaseCellLength();
    zoomInOutHelper(zoomed, actualCord);
}

/**
 * This uses the limitations of the board to see where i can zoom
 */
function zoomInOutHelper(zoomed, actualCord) {
    //IF I AM ALREADY ZOOMED TO THE MAX, KEEP MY CANVAS AT CURRENT POINT else
    //SHIFT THE CENTER TO THE ACTUAL POINT OF INTEREST
    if (zoomed == true) {
        zoomToCurrentSpot(actualCord.x, actualCord.y);
    } else {
        setCanvasCenter(currentCordOfCanvas.x, currentCordOfCanvas.y);
    }
    renderAllCells();
}

/**
 * when the user scrolls, zoom to the current center of the screen;
 */
function zoomToCurrentSpot(x, y) {
    //SET MY CANVAS TO CENTER
    setCanvasCenter(CENTER_OF_CANVAS.X, CENTER_OF_CANVAS.Y);

    //IF MY CELL LENGTH IS ALLOWED
    if (cellLength != MIN_CELL_LENGTH) {

        //TRANSLATE THE CENTER TO THE DELTA OF THE CENTER TO THE ACTUAL CELL
        //THEN MULTIPLY IT BY THE CELL LENGTH TO SHIFT THE CENTER THE APPROPRIATE
        //SPOT ON THE CANVAS
        translateCanvasCenter((CENTER_OF_CANVAS.X - x) * cellLength, (CENTER_OF_CANVAS.Y - y) * cellLength);

        //DEFINE SHIFTING
        var shiftRight = {
            x: 10,
            y: 0
        };
        var shiftLeft = {
            x: -10,
            y: 0
        };
        var shiftUp = {
            x: 0,
            y: 10
        };
        var shiftDown = {
            X: 0,
            y: -10
        };

        //CHECK IF I CAN MOVE IN ANY DIRECTION TO CORRECT FOR ZOOMING OUT OF CANVAS
        checkLimitedMovement(shiftRight);
        checkLimitedMovement(shiftLeft);
        checkLimitedMovement(shiftUp);
        checkLimitedMovement(shiftDown);
    }
}

function clearCanvas() {
    canvas2D.clearRect(-(canvasWidth / 2), -(canvasHeight / 2), canvasWidth, canvasHeight);
}

function stressTest(){
  for(var indexX=0; indexX<BOARD_WIDTH_MAX; indexX++){
    for(var indexY=255; indexY<=257; indexY++){
      var currentCell = currentBoardOfCells[indexX][indexY];
      currentCell.isDead = LIVE_CELL;
      liveCells.push(currentCell);
      renderCell(currentCell.x, currentCell.y, LIVE_COLOR);
    }
  }
}

/** ---------------------- GAME OF LIFE FUNCTIONS START --------------------------- **/
/**
 * start the game of life
 */
function startGameOfLife() {
    // CLEAR OUT ANY OLD TIMER
    if (timer !== null) {
        clearInterval(timer);
    }

    // START A NEW TIMER
    timer = setInterval(stepGameOfLife, MILLISECONDS_IN_ONE_SECOND / currentFPS);
}

/**
 * updates and renders game based on time interval or fps
 */
function stepGameOfLife() {
    // FIRST PERFORM GAME LOGIC
    updateGame();

    //THEN RENDER THE GAME
    renderGame();
}

/**
 * UPDATES THE CURRENT BOARD OF CELLS BASED ON THE RULES OF THE GAME
 */
function updateGame() {
    //GO THROUGH ALL CURRENT LIVE CELLS
    while (!arrayIsEmpty(liveCells)) {
        var cell = liveCells.pop();

        //ONLY CHECK THE CELL IF IT'S UNCEHCKED
        if (cell.isChecked == UNCHECKED) {
            check(cell);
        }

    }

    //AFTER CHECKING ALL CELLS, I HAVE A LIST OF CELLS THAT HAVE
    //THEIR ASSOCIATED NUMBER OF NIEGHBORS
    while (!arrayIsEmpty(checkedCells)) {
        var currentCell = checkedCells.pop();

        //FOR EACH CELL, IF IT'S VALID, THEN BRING IT TO LIFE, ELSE
        //KILL IT IF IT WAS ALREADY ALIVE
        if (checkIfLiveCell(currentCell)) {

            //ADD IT TO NEXT ROUND OF LIVE CELLS
            liveCells.push(currentCell);
            currentCell.isDead = LIVE_CELL;
        } else {
            currentCell.isDead = DEAD_CELL;
        }
        currentCell.isChecked = UNCHECKED;
        currentCell.numNeigh = DEFAULT_NUM_NEIGH;
    }
}

/**
 * RENDERS ALL CURENT LIVE CELLS
 */
function renderGame() {
    //CLEAR THE CANVS
    clearCanvas();

    //RENDER THE CELLS
    renderAllCells();
}

/**
 * GOES THROUGH EACH CELL THAT I MUST CHECK (every live cell and it's neighbors)
 * FOR THE NEXT BOARD
 */
function check(cell) {
    //TAKE CURRENT LIVE CELL AND CHECK A ONE CELL RADIUS AROUND IT
    for (var xIndex = -1; xIndex <= 1; xIndex++) {
        for (var yIndex = -1; yIndex <= 1; yIndex++) {

            //CHECK IF CELL IS VALID / ON THE BOARD
            if (isValidCell(cell.x + xIndex, cell.y + yIndex)) {
                var checkingCell = currentBoardOfCells[cell.x + xIndex][cell.y + yIndex];

                //IF THE CELL IS UNCHECKED
                if (checkingCell.isChecked == UNCHECKED) {
                    //CHECK IT SO THAT IT PREVENTS THE Check() METHOD FROM
                    //CALLING COUND ON THE SAME CELL
                    checkingCell.isChecked = CHECKED;

                    //ADD IT TO THE ARRAY OF ALREADY CHECKED CELLS FOR FUTURE PROCESSING
                    checkedCells.push(checkingCell);

                    //FIND THE NUM OF NEIGHBORS
                    calcNumNeigh(checkingCell);
                }
            }

        }
    }
}

/**
 * Calculate the number of neighbors of the cell
 */
function calcNumNeigh(cell) {
    //CHECK A ONE BLOCK RADIUS AROUND THIS CELL
    for (var xIndex = -1; xIndex <= 1; xIndex++) {
        for (var yIndex = -1; yIndex <= 1; yIndex++) {
            if (isValidCell(cell.x + xIndex, cell.y + yIndex)) {

                //CHECK IF CELL IS VALID / ON THE BOARD
                var checkingCell = currentBoardOfCells[cell.x + xIndex][cell.y + yIndex];

                //IF IT"S A LIVE CELL AND NOT ITSELF, THEN IT HAS A NEIGHBOR
                if (checkingCell.isDead == LIVE_CELL && cell != checkingCell) {
                    cell.numNeigh++;

                    //IF IT's A LIVE CELL AND NOT ITSELF, AND IS NOT CHECKED YET, CHECK IT
                    if (checkingCell.isChecked == UNCHECKED) {
                        check(checkingCell);
                    }
                }
            }
        }
    }
}

/**
 * Check to see if my current cell is allowed to live
 */
function checkIfLiveCell(cell) {
    var numNeigh = cell.numNeigh;

    //If current cell has 2 or three neighbors
    if (numNeigh == 2 || numNeigh == 3) {

        //If it has three neighbors, it's alive, it it has two neighbors
        //and it is not alive already, then it cannot be given life
        if(cell.isDead==LIVE_CELL || numNeigh==3){
          return true;
        }
    }
    return false;
}

/**
 * Check if the cell is within the board
 */
function isValidCell(x, y) {
    // IS IT OUTSIDE THE GRID?
    if ((x < 0) ||
        (y < 0) ||
        (x >= BOARD_WIDTH_MAX) ||
        (y >= BOARD_HEIGHT_MAX)) {
        return false;
    }
    // IT'S INSIDE THE GRID
    else {
        return true;
    }
}

/**
 * return if the current array is empty
 */
function arrayIsEmpty(array) {
    if (array === undefined || array.length == 0) {
        return true;
    } else {
        return false;
    }
}

/**
 * pause the game, clear the timer
 */
function pauseGameOfLife() {
    // TELL JavaScript TO STOP RUNNING THE LOOP
    clearInterval(timer);

    // AND THIS IS HOW WE'LL KEEP TRACK OF WHETHER
    // THE SIMULATION IS RUNNING OR NOT
    timer = null;
}

/**
 * resets the board of cells
 */
function resetGameOfLife() {
    while (!arrayIsEmpty(liveCells)) {
        var currentCell = liveCells.pop();
        currentCell.isDead = DEAD_CELL;
        currentCell.isChecked = UNCHECKED;
        currentCell.numNeigh = DEFAULT_NUM_NEIGH;
        clearCanvas();
    }
}

/**
 * changes the framerate of the game
 */
function changeFPS() {
    pauseGameOfLife();
    if (paused == UNPAUSED) {
        startGameOfLife();
    }
}

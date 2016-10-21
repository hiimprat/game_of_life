#Simulation of John Conways Game of Life
This is a game by John Conway in which houses on the grid can either live or die based on the amount of neighbors each space has.
This creates many interesting patterns which can be found here: http://conwaylife.com/


#Javascript implementation (most recent):
By default:

-Left Click/Drag to add houses

-Right drag to scroll around the grid

-Use the mouse scrollwheel to zoom in/out of desired area

-A clear board

Using the toolbar you can do all of the above using just the left mouse button for users with no scroll or right click.

The grid is locked at 1028 * 512 at all zoom levels. This gives enough room for drawing meticulously as well as watching your creation at a small scale.


#JavaFX implementation (not updated):

-Left Click/Drag to add houses

-Right CLick/Drag to delete houses

-You can edit the board while it is active (Yay for 2 threads)

-The speed slider will take into affect after you click pause and play (Working on making it instantaneous)

-The game is currently locked at 90*90 houses (Looking at possible ways for expansion repsective to a slider or stage dimensions)


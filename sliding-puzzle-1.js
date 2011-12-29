/* 
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
Title : Project 1 Sliding Block Puzzle
Author : Kelsey Lee
Created : 9/9/2011
Modified : 
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
*/

//info for img1
var _image_path = "img1.jpg";
var _image_width =  640;
var _image_height = 426;
//max number of rows/cols possible
var _num_rows = 4;
var _num_cols = 4;

var _cols, _rows, _img; //shows the num of cols/rows in the puzzle
var _empty_tile = {row:0, col: 0};  //location of empty tile
var _numTilesToMove; //is a ctr to indicate how many moves til completing, when autosolve is pressed
var _missingTile;//stores the missing tile to display when puzzle is complete

//this variable stores the tiles in their current order
//empty tile is also stored, but as 0
var _puzzle_board = [] 

//stores which tiles were moved, with most recent at end
//can use this to solve puzzle with answer button
var _solution = []; 

//information about the puzzle images
//var img1 = {path: "img1.jpg", width: 640, height: 426, info: "?"};
var img2 = {path: "http://www.kelseyphoenix.com/wp-content/uploads/2011/12/img2.png", width: 614, height: 461, info: "Greece"};
var img3 = {path: "img3.jpg", width: 547, height: 455, info: "South Africa"};
var img4 = {path: "img4.jpg", width: 660, height: 435, info: "Rome, Italy"};
var img5 = {path: "img5.jpg", width: 657, height: 437, info: "Barcelona, Spain"};
var img6 = {path: "img6.jpg", width: 673, height: 401, info: "Hong Kong"};
var img7 = {path: "img7.jpg", width: 597, height: 446, info: "Hoboken, NJ"};
var img8 = {path: "img8.jpg", width: 677, height: 443, info: "Cusco, Peru"};
var img9 = {path: "img9.jpg", width: 599, height: 440, info: "The High Line, NY"};
var _images = [img2, img3, img4, img5, img6, img7, img8, img9];
var _numImages = 8;


/*
 * Summary: creates puzzleboard by calling createDiv for each tile
 * Returns: prints out puzzleboard to page
 */
function createTiles(){
	//calculates tile dimensions
	var tileWidth = _images[_img].width/_cols;
	var tileHeight = _images[_img].height/_rows;

	//creates tiles
	for (var row=0; row<_rows; row++) {
		for (var col=0; col<_cols; col++) {
        	var tile = createDiv(tileWidth, tileHeight, row, col);
			//bottom right tile: will be missing
			if (row===(_rows-1) && col===(_cols-1)) {
				//if it's bottom right tile, make it empty, set _empty_tile
				_empty_tile.row = row;
				_empty_tile.col = col;
				_puzzle_board.push(0); //stores location of empty tile in the board
                _missingTile = tile;
			}
			//creates all other tiles
			else {
                //order attributesays which numbered tile in the original puzzle this should be
				tile.order = (row*_cols) + col; 
				_puzzle_board.push(tile);
			}
		}
	}  
	//mixes up tile order
	shuffleTiles();
	
	//puts puzzle tiles on page
	for (var piece=0; piece<_puzzle_board.length; piece++) {
		if (_puzzle_board[piece] !==0) {
			document.getElementById("tileBoard").appendChild(_puzzle_board[piece]);
		}
	}
}

/*
 * Summary: Should return a div with the specified width and height 
 * and put it at the supplied row and column
 * Parameters:
 * Returns: The div you created
 */
function createDiv(width, height, row, col){
  	// create your div and set its size & position attributes
  	// based on parameters
  	var tile = document.createElement('div');
  	tile.row=row; //to track current location in puzzle
  	tile.col=col; //to track current location in puzzle
  	tile.width=width;  
  	tile.height=height; 
  	tile.style.left=col*width + "px";  //shows where tile will be placed
  	tile.style.top=row*height+"px"; //shows where tile will be placed
  	tile.style.width=width + "px"; 
  	tile.style.height=height + "px";
  	tile.style.position="absolute";
  
  	// Set the div's background path
  	tile.style.backgroundImage = 'url("' + _images[_img].path + '")';
  	//points to where in img this tile will reveal 
  	tile.style.backgroundPosition = "-" + tile.style.left + " -" + tile.style.top;
  	tile.style.backgroundRepeat="none";
 	
    //when tile is clicked it will use a fadeIn effect to move to its new spot
  	tile.opacity=1.0;
  	tile.onclick = tileClicked;
  	tile.fadeIn = function() {
		if(tile.opacity < 1.0){
			tile.opacity += 0.1;
			tile.style.opacity = tile.opacity;
			setTimeout(tile.fadeIn, 30);
		}
	}
	return tile;
}

/*
 * Summary: Example function that could get called when a tile is clicked.
 * Parameters:
 */
function tileClicked(sender, event){
	var tile = sender.target;
	//calculates where in _puzzle_board empty tile currently is
    var emptyPos = (_empty_tile.row)*_cols + _empty_tile.col;
    
   //cannot move puzzle piece if already solved puzzle
	if (checkOrder()===true) {
		console.log("already solved");
		return;
	}
	 //figure out which tile empty tile is switching with
	//empty tile is moving left
    if (tile.row === _empty_tile.row && tile.col === (_empty_tile.col-1)) {
		emptyToLeft(emptyPos, tile);
    }
    //empty tile is moving right
    else if (tile.row === _empty_tile.row && tile.col === (_empty_tile.col+1)) {
		emptyToRight(emptyPos, tile);
    }
    //empty tile is moving up
    else if (tile.col===_empty_tile.col && tile.row === (_empty_tile.row-1)) {
		emptyToUp(emptyPos, tile);
    }
    //empty tile is moving down
    else if (tile.col===_empty_tile.col && tile.row === (_empty_tile.row+1)) {
		emptyToDown(emptyPos, tile);
    }
	//empty tile cannot move
	else {
		console.log("no move to be made");
		return;
	}
	
  	//fade in the tile
  	tile.opacity=0.0;
  	tile.style.opacity =this.opacity;
  	tile.fadeIn();
  	
  	//will print a console message if the puzzle has been solved
    var solved = checkOrder();
}

//determines if order of tiles is correct, ie that it is solved
function checkOrder() {
    var solved=false;
    //arrOrder will store current order of tiles, if correct it will read [0,1,2,...n, "empty"]
    var arrOrder=[];
    for (var i=0; i<_rows*_cols; i++) { 
        if (_puzzle_board[i] ===0) {
            arrOrder.push("empty");
        }
        else {
            arrOrder.push(_puzzle_board[i].order);
        }
    }
    //console.log(arrOrder);
    
    //checks to see if tiles are in order with empty last, ie if solved
    if (_puzzle_board[(_rows*_cols)-1]===0) {
        solved=true;
        for (var i=0; i<(_rows*_cols)-1; i++) { 
            if (_puzzle_board[i].order !== i) {
                solved=false;
                break;
            }
        }
    }
    console.log("solved = " + solved); //prints boolean for if solved
    
    //if solved insert the last tile
    if (solved===true) {
        _missingTile.opacity=0.0;
        _missingTile.style.opacity =this.opacity;
        _missingTile.fadeIn();
        document.getElementById("tileBoard").appendChild(_missingTile);
    }
    return solved;
}

/*
 * Summary: Shuffle up the tiles in the beginning of the game
 * this is done by randomly choosing which direction to move the empty tile in
 * and then repeating this procedure, that way the puzzle is solvable
 */
function shuffleTiles(){
	var direction = ""; 
	
	//number of times that empty tile will move at most
	//if the empty tile is supposed to be moved in one direction, but that will
	//undo the previous move then this shuffle action will not occur
	for (var i=0; i<((_rows+2)*(_cols+1)); i++) {
		var newPosition = {row: _empty_tile.row, col:_empty_tile.col};
		
		//loops to find next direction for empty tile to move
		while (_empty_tile.row === newPosition.row && _empty_tile.col === newPosition.col) {
			//chooses which direction to move empty tile
			var dir = Math.floor(Math.random()*4);
			if (dir === 0 ){ 
				newPosition.col = _empty_tile.col -1;
				direction="left";
			}
			else if (dir ===1) {
				newPosition.col = _empty_tile.col +1;
				direction="right";
			}
			else if (dir ===2) {
				newPosition.row = _empty_tile.row -1;
				direction="up";
			}
			else { 
				newPosition.row = _empty_tile.row +1;
				direction="down";
			}
			//checks to see if tile CAN move in the chosen direction
			if (newPosition.row<0 || newPosition.row>=_rows ||
				newPosition.col<0 || newPosition.col>=_cols) {
				newPosition.row = _empty_tile.row;
				newPosition.col=_empty_tile.col;
			}
		}
		//finds where empty tile is in puzzle
		var emptyPos = (_empty_tile.row)*_cols + _empty_tile.col; 
		var tileToMove = {};
		
		//calls upon other functions to move the empty tile
		if (direction==="left") {
			tileToMove = _puzzle_board[emptyPos-1];
			//should not move tile if it was moved last time (ie if that
			//transformation from before is going to be undone)
			if (tileToMove.order === _solution[_solution.length-1]) {
				continue;
			}
            emptyToLeft(emptyPos, tileToMove);
		}
		else if (direction==="right") {
			tileToMove = _puzzle_board[emptyPos+1];
			if (tileToMove.order === _solution[_solution.length-1]) {
				continue;
			}
			emptyToRight(emptyPos, tileToMove);
		}
		else if (direction==="up") {
			tileToMove = _puzzle_board[emptyPos-_cols];
			if (tileToMove.order === _solution[_solution.length-1]) {
				continue;
			}
			emptyToUp(emptyPos, tileToMove);
		}
		else{
			tileToMove = _puzzle_board[emptyPos+_cols];
			if (tileToMove.order === _solution[_solution.length-1]) {
				continue;
			}
            emptyToDown(emptyPos, tileToMove);
		}
	}
	//console.log(_solution);
	return;
}


//carries out empty tile moving to the left
function emptyToLeft(emptyPos, tile) {
	//records which order #'d tile is being moved
    _solution.push(tile.order);
    //resets that tile's position on page
    tile.style.left = _empty_tile.col*tile.width + "px";
    //update's its current column
    tile.col +=1;
    //current order of tiles must be updated
    _puzzle_board[emptyPos-1] = 0;
    _puzzle_board[emptyPos] = tile;
    //update's empty tile's position
    _empty_tile.col-=1;

}

function emptyToRight(emptyPos, tile) {
    _solution.push(tile.order);
    tile.style.left = _empty_tile.col*tile.width + "px";
    tile.col -=1;
    _puzzle_board[emptyPos+1] = 0;
    _puzzle_board[emptyPos] = tile;
    _empty_tile.col+=1;
}

function emptyToUp(emptyPos, tile) {
    _solution.push(tile.order);
    tile.style.top = _empty_tile.row*tile.height + "px";
    tile.row +=1;
    _puzzle_board[emptyPos-_cols] = 0;
    _puzzle_board[emptyPos] = tile;
    _empty_tile.row-=1;
}

function emptyToDown(emptyPos, tile) {
    _solution.push(tile.order);
    tile.style.top = _empty_tile.row*tile.height + "px";
    tile.row -=1;
    _puzzle_board[emptyPos+_cols] = 0;
    _puzzle_board[emptyPos] = tile;
    _empty_tile.row+=1;
}
/*
 * when puzzle solution button is clicked will trigger puzzle solve 
 */
function buttonClicked(sender, event){
	var button = sender.target;
    console.log("puzzle solution button clicked");
  	button.opacity=0.0;
  	button.style.opacity =this.opacity;
  	button.fadeIn();
  	//solve puzzle
    _numTilesToMove = _solution.length-1; //marks where in solution to start
    button.solve();
}


/*
 * Displays full image and answer button
 */
 //displays full image of puzzle + has answer button
function answer() {
	//displays text about image
    var picInfo = document.createTextNode(_images[_img].info);
    document.getElementById("solution").appendChild(picInfo);
    
    //shows what puzzle should look like
	var tile = document.createElement('img');
    tile.setAttribute("src", _images[_img].path);
    tile.style.clear = "both";
  	tile.style.width="90%";
    tile.style.marginTop=20+ "px";
  	document.getElementById("solution").appendChild(tile);
   
   //puzzle solution button with "puzzle solution" text
    var button = document.createElement('div');
    button.style.left=((290*.7)/2) + "px";
  	button.style.marginTop=50 + "px";
  	button.style.width="30%";
  	button.style.height=50 + "px";
    button.style.color="white";
    button.style.backgroundColor="#333333";
    button.style.border="none";
    button.style.fontSize=20 + "px";
    
    var text = document.createTextNode("Puzzle Solution");
    button.appendChild(text);
    
    //fading in effect when button is clicked 
  	button.opacity=1.0;
  	button.onclick = buttonClicked;
  	button.fadeIn = function() {
		if(button.opacity < 1.0){
            button.opacity += 0.1;
			button.style.opacity = button.opacity;
			setTimeout(button.fadeIn, 20);
		}
	}
	
    //solving puzzle
    button.solve = function() {
    	//make sure puzzle isn't already solved 
        if (checkOrder()===false && _numTilesToMove>=0) {
            var i=_numTilesToMove;
           //console.log(_solution);
            var j=0;
            var tileToMovePos=-1;
            
            //_solution[i] says which tile should be moved
            //find where in the puzzle board this piece exists
            while (tileToMovePos===-1 && j<_cols*_rows) {
                if (_puzzle_board[j] ===0 ||  _puzzle_board[j].order !== _solution[i]) {
                    j++;
                }
                else {
                    tileToMovePos=j;
                }	
            }
            
            //figure out which way that piece needs to be moved so that 
            //it switches with the empty space
            var emptyPos = (_empty_tile.row)*_cols + _empty_tile.col;
            if (tileToMovePos === (emptyPos - 1) ) { //left
                emptyToLeft(emptyPos, _puzzle_board[j]);
            }
            else if (tileToMovePos === (emptyPos + 1)) { //right
                emptyToRight(emptyPos, _puzzle_board[j]);
            }
            else if (tileToMovePos === (emptyPos - _cols)) { //up
                emptyToUp(emptyPos, _puzzle_board[j]);
            }
            else if (tileToMovePos === (emptyPos + _cols)) { //down
                emptyToDown(emptyPos, _puzzle_board[j]);
            }
            //fade in the piece in its new spot
            _puzzle_board[emptyPos].opacity=0.0;
            _puzzle_board[emptyPos].style.opacity =this.opacity;
            _puzzle_board[emptyPos].fadeIn();
            
            //update pointer to next piece to move to solve
            _numTilesToMove--;
            setTimeout(button.solve,600);
        }
	}
    document.getElementById("solution").appendChild(button);
}


/*
 * Summary: Generates a random puzzle
 */
function generateRandomPuzzle(){
	//determines puzzle dimensions
	_rows = Math.floor(Math.random()*(_num_rows-1))+2; 
	_cols = Math.floor(Math.random()*(_num_cols-1))+2;
	//chooses which image to use
	_img = 0;// Math.floor(Math.random()*_numImages);
    
    //generates solution picture + puzzle solution button
	answer();
	//creates puzzle
	createTiles();
}

/*
 * When the page loads, create our puzzle
 */
window.onload = function () {
  generateRandomPuzzle();
}
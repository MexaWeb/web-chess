if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");

Array.prototype.equals = function (array) {
    if (!array)
        return false;

    if(array === this)
        return true;

    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        if (this[i] instanceof Array && array[i] instanceof Array) {
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            return false;   
        }           
    }       
    return true;
}
Object.defineProperty(Array.prototype, "equals", {enumerable: false});


const chessboardCanvas = document.getElementById("chessboard")
const popup = document.getElementById("popup")



const ctx = chessboardCanvas.getContext("2d");

let selectedPiece
let activeMoveCells = []
let turn = "white"
let check = undefined
let chessboard = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
]

const numPieceMap = {
    0: "",
    "pawn": "\uf443",
    "rook": "\uf447",
    "knight": "\uf441",
    "bishop": "\uf43a",
    "queen": "\uf445",
    "king": "\uf43f"
}

const pieceMoves = {
    "pawn": {
        vectors: [[0, -1]],
        repeat: false,
        attackVectors: [[1, -1], [-1, -1]]
    },
    "rook": {
        vectors: [[0, -1], [0, 1], [-1, 0], [1, 0]],
        repeat: true,
        attackVectors: undefined
    },
    "knight": {
        vectors: [[-2, -1], [-1, -2], [1, -2], [2, -1], [2, 1], [1, 2], [-1, 2], [-2, 1]],
        repeat: false,
        attackVectors: undefined
    },
    "bishop": {
        vectors: [[1, 1], [1, -1], [-1, 1], [-1, -1]],
        repeat: true,
        attackVectors: undefined
    },
    "queen": {
        vectors: [[0, -1], [0, 1], [-1, 0], [1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]],
        repeat: true,
        attackVectors: undefined
    },
    "king": {
        vectors: [[0, -1], [0, 1], [-1, 0], [1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]],
        repeat: false,
        attackVectors: undefined
    }
}

const pieceFirstMoves = {
    "pawn": {
        vectors: [[0, -1], [0, -2]],
        repeat: false,
        attackVectors: [[1, -1], [-1, -1]]
    },
    "rook": pieceMoves.rook,
    "knight": pieceMoves.knight,
    "bishop": pieceMoves.bishop,
    "queen": pieceMoves.queen,
    "king": pieceMoves.king
}

class Piece {
    constructor(pieceName, player) {
        this.pieceName = pieceName
        this.player = player
        this.moved = false
    }
	clone() {
		const copy = new Piece(this.pieceName, this.player)
		copy.moved = this.moved
		return copy
	}
}

function cloneBoard(board) {
    return board.map(row =>
        row.map(cell =>
            cell === 0 ? 0 : cell.clone()
        )
    )
}


function render(canvas, ctx, chessboard, highlightedCells=[]) {

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const cellSize = canvas.width / 8;

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {



            if ((x + y) % 2 === 0) {
                ctx.fillStyle = "rgba(255, 218, 203, 1)"
            }
            else {
                ctx.fillStyle = "rgba(114, 80, 67, 1)"
            }

            for (let index = 0; index < highlightedCells.length; index++) {
                const coordinates = highlightedCells[index];
                if (x == coordinates[0]-1 && y == coordinates[1]-1) {
                    ctx.fillStyle = "rgba(255, 50, 50, 1)"
                }
            }

            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);


            const piece = chessboard[y][x];
            let fontsize = cellSize * 0.75
            
            ctx.font = `${fontsize}px FontAwesome`;

            if (chessboard[y][x] != 0) {
                let color
                if (piece.player == "white") {
                    color = "rgb(255, 255, 255)"
                    stroke = "rgb(0, 0, 0)"
                }
                else {
                    color = "rgb(0, 0, 0)"
                    stroke = "rgb(255, 255, 255)"
                }

                centerText(ctx, numPieceMap[piece.pieceName], x * cellSize, y * cellSize + fontsize/2 - fontsize*0.1, cellSize, cellSize, color, stroke);

            }
        }
    }
    if (selectedPiece != undefined) {
        drawCircle(canvas, ctx, selectedPiece[0], selectedPiece[1], "rgba(0, 0, 0, 0.05)")
        showMoves(canvas, ctx, activeMoveCells)
    }
}

function drawCircle(canvas, ctx, x, y, color) {
    const cellSize = canvas.width / 8;
    ctx.fillStyle = color
    ctx.beginPath();
    let pixelCoords = cellToPixelCoordinates(canvas, x, y)
    ctx.arc(pixelCoords[0], pixelCoords[1], cellSize * 0.30, 0, 2 * Math.PI);
    ctx.fill();
}

function centerText(ctx, string, x, y, width, height, color, stroke) {
    let textWidth = ctx.measureText(string).width;
    
    ctx.fillStyle = color
    ctx.lineWidth = 3;
    ctx.strokeStyle = stroke;
    let textx = x + (width / 2) - (textWidth / 2)
    let texty = y + height / 2
    ctx.strokeText(string, textx, texty);
    ctx.fillText(string, textx, texty);
}

function pixelToCellCoordinates(canvas, x, y) {
    let cellX = Math.ceil(x / canvas.width * 8)
    let cellY = Math.ceil(y / canvas.height * 8)

    return [cellX, cellY]
}

function cellToPixelCoordinates(canvas, cellX, cellY) {
    let x = (cellX - 1) * (canvas.width / 8) + (canvas.width / 16);
    let y = (cellY - 1) * (canvas.height / 8) + (canvas.height / 16);
    return [x, y];
}

function getMousePos(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function placePiece(chessboard, pieceName, x, y, player) {
    let boardY = y - 1
    let boardX = x - 1

    chessboard[boardY][boardX] = new Piece(pieceName, player)
}

function getPiece(chessboard, x, y) {
    let boardY = y - 1
    let boardX = x - 1

    return chessboard[boardY][boardX]
}

function movePiece(chessboard, pieceX, pieceY, targetX, targetY) {
    let piece = chessboard[pieceY-1][pieceX-1]
    piece.moved = true
    chessboard[pieceY-1][pieceX-1] = 0
    chessboard[targetY-1][targetX-1] = piece

}

function isCheck(chessboard, returnDetails) {
    let check = false
    let checkmate = false
    let checkedPlayer = undefined
    let attackingPieceCoordinates = undefined
    let kingCoordinates = undefined

	let validCheckMoves = [
		[[], [], [], [], [], [], [], []],
		[[], [], [], [], [], [], [], []],
		[[], [], [], [], [], [], [], []],
		[[], [], [], [], [], [], [], []],
		[[], [], [], [], [], [], [], []],
		[[], [], [], [], [], [], [], []],
		[[], [], [], [], [], [], [], []],
		[[], [], [], [], [], [], [], []]
	]
	
    for (let y = 1; y <= 8; y++) {
        for (let x = 1; x <= 8; x++) {
            let pieceMoves = getPieceMoveCells(chessboard, x, y, undefined, true)

            if (pieceMoves === undefined) {
                continue
            }
            for (let index = 0; index < pieceMoves.length; index++) {
                const move = pieceMoves[index];
                let targetPiece = getPiece(chessboard, move[0], move[1])
                if (targetPiece !== 0) {

                    if (targetPiece.pieceName == "king") {
                        check = true
                        attackingPieceCoordinates = [x, y]
                        checkedPlayer = targetPiece.player
                        kingCoordinates = [move[0], move[1]]
                    }
                }
            }
        }
    }

    if (check === true && returnDetails === true) {
        for (let y = 1; y <= 8; y++) {
            for (let x = 1; x <= 8; x++) {
                
                let pieceMoves = getPieceMoveCells(chessboard, x, y, undefined, true)
                if (pieceMoves === undefined) {
                    continue
                }

                for (let index = 0; index < pieceMoves.length; index++) {
                    const move = pieceMoves[index];
                    let simulatedChessboard = cloneBoard(chessboard)
                    
					if (getPiece(simulatedChessboard, x, y).player == checkedPlayer) {
						movePiece(simulatedChessboard, x, y, move[0], move[1])
					}
                    
					let ischeck = isCheck(simulatedChessboard, false)
					if (!ischeck.check) {
                        if (validCheckMoves[y-1][x-1] === 0) {
                            validCheckMoves[y-1][x-1] = []
                        }
                        validCheckMoves[y-1][x-1].push(move)
                    }

                }

            }
        }
        if (validCheckMoves.equals([
            [[], [], [], [], [], [], [], []],
            [[], [], [], [], [], [], [], []],
            [[], [], [], [], [], [], [], []],
            [[], [], [], [], [], [], [], []],
            [[], [], [], [], [], [], [], []],
            [[], [], [], [], [], [], [], []],
            [[], [], [], [], [], [], [], []],
            [[], [], [], [], [], [], [], []]
        ])) {
            checkmate = true
        }
    }

    return { check, checkmate, checkedPlayer, attackingPieceCoordinates, kingCoordinates, validCheckMoves}
}

function playerHasAnyMoves(chessboard, player) {
    for (let y = 1; y <= 8; y++) {
        for (let x = 1; x <= 8; x++) {
            const piece = getPiece(chessboard, x, y);
            if (piece === 0 || piece.player !== player) continue;
            const moves = getPieceMoveCells(chessboard, x, y, isCheck(chessboard, true));
            if (moves.length === 0) continue;

            for (const move of moves) {
                const simulatedBoard = cloneBoard(chessboard);
                movePiece(simulatedBoard, x, y, move[0], move[1]);

                const check = isCheck(simulatedBoard, true);
                if (!check.check || check.checkedPlayer !== player) {
                    return true;
                }
            }
        }
    }

    return false;
}


function isStalemate(chessboard, isCheckmateOrCheck) {
    whiteHasMoves = playerHasAnyMoves(chessboard, "white");
    blackHasMoves = playerHasAnyMoves(chessboard, "black");
    let stalemate

    if (isCheckmateOrCheck === false && (blackHasMoves == false || whiteHasMoves === false)) {
        stalemate = true
    }
    else {
        stalemate = false
    }

    return stalemate
}


function getPieceMoveCells(chessboard, x, y, check, ignorecheck=false) {
    if (check !== undefined) {
        if (check.check === true) {
            let moveCells = check.validCheckMoves[y-1][x-1]
            return moveCells
        }
    }

    const piece = getPiece(chessboard, x, y)
    if (piece === 0) {
        return undefined
    }
    const moveCells = [];
    const movementDict = piece.moved ? pieceMoves : pieceFirstMoves;
    const moves = movementDict[piece.pieceName];
    let pawnCollided = false;

    let vectors = moves.vectors;
    let attackVectors = moves.attackVectors

    if (piece.player === "black") {
        vectors = vectors.map(([dx, dy]) => [-dx, -dy]);
        if (attackVectors !== undefined) {
            attackVectors = attackVectors.map(([dx, dy]) => [-dx, -dy]);
        }

    }

    const enemy = piece.player === "white" ? "black" : "white";

    for (const [dx, dy] of vectors) {
        let steps = 1;
        if (pawnCollided === true) break;

        while (true) {
            const cellX = x + dx * steps;
            const cellY = y + dy * steps;

            if (cellX < 1 || cellX > 8 || cellY < 1 || cellY > 8)
                break;

            const target = getPiece(chessboard, cellX, cellY);

            if (target !== 0 && target.player === enemy) {
                if (piece.pieceName != "pawn") {
                    if (!ignorecheck) {
                        let simulatedChessboard = cloneBoard(chessboard)
                        movePiece(simulatedChessboard, x, y, cellX, cellY)
                        let check = isCheck(simulatedChessboard, true)

                        if (!check.check || check.checkedPlayer !== piece.player) {
                            moveCells.push([cellX, cellY]);
                        }
                    }
                    else {
                        moveCells.push([cellX, cellY]);
                    }

                }
                else {
                    pawnCollided = true;
                    break;
                }
                break;
            }
            else {
                if (target !== 0) break;
                    if (!ignorecheck) {
                        let simulatedChessboard = cloneBoard(chessboard)
                        movePiece(simulatedChessboard, x, y, cellX, cellY)
                        let check = isCheck(simulatedChessboard, true)

        
                        if (!check.check || check.checkedPlayer !== piece.player) {
                            moveCells.push([cellX, cellY]);
                        }    
                    }
                    else {
                        moveCells.push([cellX, cellY]);
                    }
            }







            if (!moves.repeat) break;
            steps++;
        }
    }

    if (attackVectors !== undefined) {
        for (const [dx, dy] of attackVectors) {
            let steps = 1;

            while (true) {
                const cellX = x + dx * steps;
                const cellY = y + dy * steps;

                if (cellX < 1 || cellX > 8 || cellY < 1 || cellY > 8)
                    break;

                const target = getPiece(chessboard, cellX, cellY);


                if (target !== 0 && target.player === enemy) {
                    moveCells.push([cellX, cellY]);

                }

                if (target == 0) break;



                if (!moves.repeat) break;
                steps++;
            }
        }
    }


    return moveCells;
}

function showMoves(canvas, ctx, cells) {
    for (let cell = 0; cell < cells.length; cell++) {
        const coordinates = cells[cell];
        drawCircle(canvas, ctx, coordinates[0], coordinates[1], "rgba(0, 0, 0, 0.2)")

    }
}

window.addEventListener('resize', function (e) {
    render(chessboardCanvas, ctx, chessboard, highlightedCells)
})


let highlightedCells = []

chessboardCanvas.addEventListener('click', function (event) {
    const mousePos = getMousePos(chessboardCanvas, event);
    let cellCoords = pixelToCellCoordinates(chessboardCanvas, mousePos.x, mousePos.y)
    let piece = getPiece(chessboard, cellCoords[0], cellCoords[1])
    
    if ((activeMoveCells.some(c => c[0] === cellCoords[0] && c[1] === cellCoords[1]))) {
        movePiece(chessboard, selectedPiece[0], selectedPiece[1], cellCoords[0], cellCoords[1])
        if (turn=="white") {turn = "black"} else {turn = "white"}
        activeMoveCells = []
        selectedPiece = undefined
        let checkInfo = isCheck(chessboard, true)
        if (checkInfo.check) {
            highlightedCells.push(checkInfo.attackingPieceCoordinates)
            highlightedCells.push(checkInfo.kingCoordinates)
        } else {
            highlightedCells = []
        }

        console.log(checkInfo)
        if (isStalemate(chessboard, checkInfo.checkmate || checkInfo.check)) {
            showPopup("stalemate")
        } else if (checkInfo.checkmate) {
            showPopup(checkInfo.checkedPlayer == "black" ? "white" : "black")
        }
    }

    else if (piece != 0 && piece.player == turn) {
        selectedPiece = [cellCoords[0], cellCoords[1]]
        const check = isCheck(chessboard, true)

        activeMoveCells = getPieceMoveCells(chessboard, selectedPiece[0], selectedPiece[1], check, false)
    }
    else {
        activeMoveCells = []
        selectedPiece = undefined
    }

    render(chessboardCanvas, ctx, chessboard, highlightedCells)
});











function closePopup() {
    popup.classList.remove("whitewon");
    popup.classList.remove("blackwon");
    popup.classList.remove("stalemate");
    
    setTimeout(function () {
        popup.style.display = "none"
    }, 300)
}

function restartGame() {
    closePopup()

    selectedPiece = null
    activeMoveCells = []
    turn = "white"
    check = undefined
    chessboard = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ]

        
    placePiece(chessboard, "pawn", 1, 7, "white")
    placePiece(chessboard, "pawn", 2, 7, "white")
    placePiece(chessboard, "pawn", 3, 7, "white")
    placePiece(chessboard, "pawn", 4, 7, "white")
    placePiece(chessboard, "pawn", 5, 7, "white")
    placePiece(chessboard, "pawn", 6, 7, "white")
    placePiece(chessboard, "pawn", 7, 7, "white")
    placePiece(chessboard, "pawn", 8, 7, "white")

    placePiece(chessboard, "rook", 1, 8, "white")
    placePiece(chessboard, "knight", 2, 8, "white")
    placePiece(chessboard, "bishop", 3, 8, "white")
    placePiece(chessboard, "queen", 4, 8, "white")
    placePiece(chessboard, "king", 5, 8, "white")
    placePiece(chessboard, "bishop", 6, 8, "white")
    placePiece(chessboard, "knight", 7, 8, "white")
    placePiece(chessboard, "rook", 8, 8, "white")


    placePiece(chessboard, "pawn", 1, 2, "black")
    placePiece(chessboard, "pawn", 2, 2, "black")
    placePiece(chessboard, "pawn", 3, 2, "black")
    placePiece(chessboard, "pawn", 4, 2, "black")
    placePiece(chessboard, "pawn", 5, 2, "black")
    placePiece(chessboard, "pawn", 6, 2, "black")
    placePiece(chessboard, "pawn", 7, 2, "black")
    placePiece(chessboard, "pawn", 8, 2, "black")

    placePiece(chessboard, "rook", 1, 1, "black")
    placePiece(chessboard, "knight", 2, 1, "black")
    placePiece(chessboard, "bishop", 3, 1, "black")
    placePiece(chessboard, "queen", 4, 1, "black")
    placePiece(chessboard, "king", 5, 1, "black")
    placePiece(chessboard, "bishop", 6, 1, "black")
    placePiece(chessboard, "knight", 7, 1, "black")
    placePiece(chessboard, "rook", 8, 1, "black")
    
    render(chessboardCanvas, ctx, chessboard, highlightedCells)
}

function showPopup(whoWon) {
    switch (whoWon) {
        case "white":
            popup.style.display = null
            setTimeout(function(){
                popup.classList.add("whitewon");
            }, 300)
            break;

        case "black":
            popup.style.display = null
            setTimeout(function(){
                popup.classList.add("blackwon");
            }, 300)
            break;

        case "stalemate":
            popup.style.display = null
            setTimeout(function(){
                popup.classList.add("stalemate");
            }, 300)
            break;
    }
}





restartGame()
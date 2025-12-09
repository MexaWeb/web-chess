const chessboardCanvas = document.getElementById("chessboard")


const ctx = chessboardCanvas.getContext("2d");

let selectedPiece
let activeMoveCells = []
let turn = "white"

const numPieceMap = {
    0: "",
    "pawn": "\uf443",
    "rook": "\uf447",
    "knight": "\uf441",
    "bishop": "\uf43a",
    "queen": "\uf445",
    "king": "\uf43f"
}

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
}




function render(canvas, ctx, chessboard) {

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

function showMoves(canvas, ctx, cells) {
    for (let cell = 0; cell < cells.length; cell++) {
        const coordinates = cells[cell];
        drawCircle(canvas, ctx, coordinates[0], coordinates[1], "rgba(0, 0, 0, 0.2)")

    }
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




function getPieceMoveCells(chessboard, piece, x, y) {
    const moveCells = [];

    const movementDict = piece.moved ? pieceMoves : pieceFirstMoves;
    const moves = movementDict[piece.pieceName];
    
    let vectors = moves.vectors;
    let attackVectors = moves.attackVectors

    if (piece.player === "black") {
        vectors = vectors.map(([dx, dy]) => [-dx, -dy]);
        attackVectors = attackVectors.map(([dx, dy]) => [-dx, -dy]);

    }

    const enemy = piece.player === "white" ? "black" : "white";

    for (const [dx, dy] of vectors) {
        let steps = 1;

        while (true) {
            const cellX = x + dx * steps;
            const cellY = y + dy * steps;

            if (cellX < 1 || cellX > 8 || cellY < 1 || cellY > 8)
                break;

            const target = getPiece(chessboard, cellX, cellY);


            if (target !== 0 && target.player === enemy) {
                if (piece.attackVectors !== undefined) {
                    moveCells.push([cellX, cellY]);
                }
                break;
            }

            if (target !== 0) break;





            moveCells.push([cellX, cellY]);



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





                moveCells.push([cellX, cellY]);



                if (!moves.repeat) break;
                steps++;
            }
        }
    }

    return moveCells;
}



window.addEventListener('resize', function (e) {
    render(chessboardCanvas, ctx, chessboard)
})

chessboardCanvas.addEventListener('click', function (event) {
    const mousePos = getMousePos(chessboardCanvas, event);
    let cellCoords = pixelToCellCoordinates(chessboardCanvas, mousePos.x, mousePos.y)
    let piece = getPiece(chessboard, cellCoords[0], cellCoords[1])

    if ((activeMoveCells.some(c => c[0] === cellCoords[0] && c[1] === cellCoords[1]))) {
        movePiece(chessboard, selectedPiece[0], selectedPiece[1], cellCoords[0], cellCoords[1])
        if (turn=="white") {turn = "black"} else {turn = "white"}
        activeMoveCells = []
        selectedPiece = undefined
    }
    else if (piece != 0 && piece.player == turn) {
        selectedPiece = [cellCoords[0], cellCoords[1]]
        activeMoveCells = getPieceMoveCells(chessboard, piece, selectedPiece[0], selectedPiece[1])
    }
    else {
        activeMoveCells = []
        selectedPiece = undefined
    }

    render(chessboardCanvas, ctx, chessboard)

});










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


render(chessboardCanvas, ctx, chessboard)
console.log(chessboard)
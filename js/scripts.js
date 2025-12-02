const checkboardCanvas = document.getElementById("checkboard")

checkboardCanvas.width = checkboardCanvas.offsetWidth
checkboardCanvas.height = checkboardCanvas.offsetHeight
const ctx = checkboardCanvas.getContext("2d");

const numPieceMap = {
    0: "",
    "pawn": "\uf443",
    "rook": "\uf447",
    "knight": "\uf441",
    "bishop": "\uf43a",
    "queen": "\uf445",
    "king": "\uf43f"
}


class Piece {
    constructor(pieceName, player) {
        this.pieceName = pieceName
        this.player = player
    }
}

function render(canvas, ctx, chessboard) {
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
            ctx.font = '50px FontAwesome';

            if (chessboard[y][x] != 0) {
                let color
                if (piece.player == "white") {
                    color = "rgb(255, 255, 255)"
                }
                else {
                    color = "rgb(0, 0, 0)"
                }

                centerText(ctx, numPieceMap[piece.pieceName], x * cellSize, y * cellSize + 20, cellSize, cellSize, color);

            }
        }
    }
}


function centerText(ctx, string, x, y, width, height, color) {
    let textWidth = ctx.measureText(string).width;
    
    ctx.fillStyle = color

    let textx = x + (width / 2) - (textWidth / 2)
    let texty = y + height / 2
    ctx.fillText(string, textx, texty);
}


function placePiece(chessboard, pieceName, x, y, player) {
    let boardY = 8 - y
    let boardX = x - 1

    chessboard[boardY][boardX] = new Piece(pieceName, player)
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




placePiece(chessboard, "pawn", 1, 7, "black")
placePiece(chessboard, "pawn", 2, 7, "black")
placePiece(chessboard, "pawn", 3, 7, "black")
placePiece(chessboard, "pawn", 4, 7, "black")
placePiece(chessboard, "pawn", 5, 7, "black")
placePiece(chessboard, "pawn", 6, 7, "black")
placePiece(chessboard, "pawn", 7, 7, "black")
placePiece(chessboard, "pawn", 8, 7, "black")

placePiece(chessboard, "rook", 1, 8, "black")
placePiece(chessboard, "knight", 2, 8, "black")
placePiece(chessboard, "bishop", 3, 8, "black")
placePiece(chessboard, "queen", 4, 8, "black")
placePiece(chessboard, "king", 5, 8, "black")
placePiece(chessboard, "bishop", 6, 8, "black")
placePiece(chessboard, "knight", 7, 8, "black")
placePiece(chessboard, "rook", 8, 8, "black")





placePiece(chessboard, "pawn", 1, 2, "white")
placePiece(chessboard, "pawn", 2, 2, "white")
placePiece(chessboard, "pawn", 3, 2, "white")
placePiece(chessboard, "pawn", 4, 2, "white")
placePiece(chessboard, "pawn", 5, 2, "white")
placePiece(chessboard, "pawn", 6, 2, "white")
placePiece(chessboard, "pawn", 7, 2, "white")
placePiece(chessboard, "pawn", 8, 2, "white")

placePiece(chessboard, "rook", 1, 1, "white")
placePiece(chessboard, "knight", 2, 1, "white")
placePiece(chessboard, "bishop", 3, 1, "white")
placePiece(chessboard, "queen", 4, 1, "white")
placePiece(chessboard, "king", 5, 1, "white")
placePiece(chessboard, "bishop", 6, 1, "white")
placePiece(chessboard, "knight", 7, 1, "white")
placePiece(chessboard, "rook", 8, 1, "white")




render(checkboardCanvas, ctx, chessboard)


console.log(chessboard)
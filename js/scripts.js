const chessboardCanvas = document.getElementById("chessboard")


const ctx = chessboardCanvas.getContext("2d");

let selectedPiece

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


class Piece {
    constructor(pieceName, player) {
        this.pieceName = pieceName
        this.player = player
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
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
        ctx.beginPath();
        let pixelCoords = cellToPixelCoordinates(chessboardCanvas, selectedPiece[0], selectedPiece[1])
        ctx.arc(pixelCoords[0], pixelCoords[1], cellSize*0.30, 0, 2 * Math.PI);
        ctx.fill();
    }
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


function getMousePos(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
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



window.addEventListener('resize', function (e) {
    render(chessboardCanvas, ctx, chessboard)
})
render(chessboardCanvas, ctx, chessboard)


console.log(chessboard)


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



chessboardCanvas.addEventListener('click', function (event) {
    const mousePos = getMousePos(chessboardCanvas, event);
    let cellCoords = pixelToCellCoordinates(chessboardCanvas, mousePos.x, mousePos.y)
    let piece = getPiece(chessboard, cellCoords[0], cellCoords[1])
    if (piece != 0 && piece.player == turn) {
        selectedPiece = [cellCoords[0], cellCoords[1]]
    }
    else {
        selectedPiece = undefined
    }


    render(chessboardCanvas, ctx, chessboard)
});
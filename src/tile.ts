export class Tile {
    constructor(private ctx: CanvasRenderingContext2D,
        public v: number,
        public sX: number,
        public sY: number,
        public x: number,
        public y: number,
        public id: number) {
        let color = "";
        if (this.v === 0) {//Ground
            color = "#000000";
        } else if (this.v === 1) {//Top-Wall
            color = "#65a9f7";
        } else if (this.v === 2) {//Bottom-Wall
            color = "#ff9933";
        } else if (this.v === 3) {//Left-Wall
            color = "#0066ff";
        } else if (this.v === 4) {//Right-Wall
            color = "#6600ff";
        } else if (this.v === 5) {//Top-Left Corner
            color = "#990033";
        } else if (this.v === 6) {//Top-Right Corner
            color = "#990033";
        } else if (this.v === 7) {//Left-Bottom Corner
            color = "#990033";
        } else if (this.v === 8) {//Right-Bottom Corner
            color = "#990033";
        } else if (this.v === 9) {//Right-Wall?
            color = "#990033";
        } else if (this.v === 10) {//Not Set
            color = "#ffffff";
        }
        this.ctx.fillStyle = color;
        this.ctx.fillRect(this.x, this.y, this.sX, this.sY);
    }

    jsonify() {
        return { index: this.id, value: this.v };
    }
}

export interface tileJSON {
    index: number,
    value: number
}
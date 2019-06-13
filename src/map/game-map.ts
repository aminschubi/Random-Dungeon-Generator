import { Room } from "./room";
import { Block, getRandomIntInclusive } from "./block";
import { Tile } from "../tile"


export class Point {
    constructor(public x: number, public y: number) {
        this.x = x;
        this.y = y;
    }
}

export class GameMap {
    public gameObjects: Block[] = [];
    public blocks: Block[] = [];
    public rooms: Room[] = [];
    public walls: any[] = [];
    public tiles: Tile[] = [];

    public startBlockIndex = 0;

    public totalBlocksX: number;
    public totalBlocksY: number;
    public originalSize: number[] = [0, 0];
    public readonly pixelTileSize: number;

    public ctx: any;
    public canvas: any;
    public ySize: number;
    public xSize: number;
    public xMax: number;
    public yMax: number;
    public scale: number;

    constructor(
        public roomAmountX: number,
        public roomAmountY: number,
        public roomSize: number,
        public roomSpaceX: number,
        public roomSpaceY: number,
        public randomize: boolean,
        public randomlevel: number,
        loadBlocks?: Block[],
        scales?: number,
        xS?: number, yS?: number
    ) {
        this.canvas = document.getElementById("canvas");
        if (this.canvas.getContext) {
            //@ts-ignore
            this.ctx = this.canvas.getContext("2d");
        }
        if (!loadBlocks) {
            if (this.canvas.getContext) {
                this.totalBlocksX = roomAmountX * (roomSize + 2) + (this.roomAmountX - 1) * roomSpaceX;
                this.totalBlocksY = roomAmountY * (roomSize + 2) + (this.roomAmountY - 1) * roomSpaceY;
                this.originalSize = [(roomAmountX * (roomSize + 2)), (roomAmountX * (roomSize + 2))];

                let xT = this.totalBlocksX;
                let yT = this.totalBlocksY;

                //@ts-ignore
                let cW = this.canvas.width;
                //@ts-ignore
                let cH = this.canvas.height;
                this.xSize = (cW - xT) / xT;
                this.ySize = (cH - yT) / yT;
                if (this.xSize > this.ySize) {
                    this.xSize = this.ySize
                } else if (this.xSize < this.ySize) {
                    this.ySize = this.xSize;
                }
                console.log(this.xSize, this.ySize);
            }


            this.generateBlocks(this.blocks);
            this.generateRooms();
            if (!(roomSpaceX == 0 || roomSpaceY == 0)) {
                this.spreadRooms(this.roomSpaceX, roomSpaceY);
            } else {
                alert("X and/or Y Spread should to be > 0!");
            }

            if (randomize) {
                this.randomizeRoomSizes();
            }

            if (!(roomSpaceX == 0 || roomSpaceY == 0)) {
                this.rooms.forEach(room => {
                    room.buildCorridorsNew();
                });
            }

            //this.scale map accordingly to remove overhanging blocks after resizing rooms
            this.xMax = 0;
            for (let i = this.roomAmountX - 1; i < this.roomAmountX * this.roomAmountY; i += this.roomAmountX) {
                if (this.rooms[i].walls[1][0].position.x + this.xSize > this.xMax) {
                    this.xMax = this.rooms[i].walls[1][0].position.x + this.xSize;
                }
            }
            this.yMax = 0;
            for (let i = (this.roomAmountX * this.roomAmountY) - this.roomAmountX; i < this.roomAmountX * this.roomAmountY; i++) {
                if (this.rooms[i].walls[2][this.rooms[i].walls[2].length - 1].position.y + this.ySize > this.yMax) {
                    this.yMax = this.rooms[i].walls[2][this.rooms[i].walls[2].length - 1].position.y + this.ySize;
                }
            }
            this.scale = 1;
            if (this.xMax > this.yMax) {
                //@ts-ignore
                this.scale = this.canvas.width / (this.canvas.width - (this.canvas.width - this.xMax));
            } else if (this.yMax > this.xMax) {
                //@ts-ignore
                this.scale = this.canvas.height / (this.canvas.height - (this.canvas.height - this.yMax));
            } else if (this.yMax == this.xMax) {
                this.scale = this.canvas.width / (this.canvas.width - (this.canvas.width - this.xMax));
            }
            console.log(this.xMax, this.yMax);
        } else {
            console.log(scales);
            this.scale = scales;
            this.blocks = loadBlocks;
            this.xSize = xS;
            this.ySize = yS;
        }

        //@ts-ignore
        this.ctx.scale(this.scale, this.scale);

        this.drawBlocks(this.blocks);
    }

    drawBlocks(mapToDraw: Block[]) {
        console.log("DRAW BLOCKS");
        mapToDraw.forEach(block => {
            let t = new Tile(this.ctx, block.type, this.xSize, this.ySize, block.position.x, block.position.y, block.indexOnMap);
            console.log(t);
            this.tiles.push(t);
        });
    }

    generateBlocks(mapToFill: Block[]) {
        let blockMap = `\n`;
        let blockMapIndex = new Point(0, 0);
        let indexCounter = 0;
        for (let i = 0; i < this.totalBlocksY; i++) {
            for (var j = 0; j < this.totalBlocksX; j++) {
                var block = new Block(blockMapIndex, indexCounter);
                this.gameObjects.push(block);
                mapToFill.push(block);
                blockMap += `|${block.type}| `
                blockMapIndex = new Point(blockMapIndex.x + this.xSize, blockMapIndex.y);
                indexCounter++;
            }
            blockMap += `\n`;
            blockMapIndex = new Point(0, blockMapIndex.y + this.ySize);
        }
        console.log("BLOCKS GENERATED!");
    }

    logMap(mapToLog: Block[]) {
        let blockMap = `\n`;
        let c = 0;
        for (var i = 0; i < this.totalBlocksY; i++) {
            for (var j = 0; j < this.totalBlocksX; j++) {
                blockMap += `|${c}:${mapToLog[c].type}| `
                c++;
            }
            blockMap += `\n`;
        }
        console.log(blockMap);
    }

    generateRooms() {
        this.startBlockIndex = this.totalBlocksX + 1; //INDEX OF INNER TOPLEFT-BLOCK
        let c = 0;
        //GENERATE (roomAmount.X * roomAmountY) ROOMS
        for (let i = 0; i < this.roomAmountX * this.roomAmountY; i++) {

            //CREATE NEW ROOM
            var room = new Room(this, this.startBlockIndex, this.roomSize, c);
            this.rooms.push(room);
            c++;

            //CHECK FOR END OF ROW -> NEXT ROW
            if (c % (this.roomAmountX) == 0 && i != 0) {
                this.startBlockIndex += (this.totalBlocksX * (this.roomSize + 2)) - (this.roomSize + 2) * (this.roomAmountX - 1);
            } else {
                this.startBlockIndex += this.roomSize + 2;
            }
        }
        console.log("ROOMS GENERATED!");

    }

    spreadRooms(x: number, y: number) {
        console.log("SPREAD ROOMS AND CLOSE SURROUNDING WALLS");

        let a = (this.roomAmountX - 1);
        let b = (this.roomAmountY - 1);
        for (let i = this.rooms.length - 1; i > 0; i--) {
            this.rooms[i].moveBy(x * a, y * b);
            a--;
            if (a == -1) {
                a = (this.roomAmountX - 1);
                b--;
            }
        }
        //CLOSE ALL WALLS AROUND
        this.surroundWalls();
    }

    surroundWalls() {
        console.log("CLOSE WALLS");
        for (let i = 0; i < this.roomAmountX; i++) {

            for (let j = 1; j < this.roomSize + 1; j++) {
                this.rooms[i].walls[0][j].changeType(1);
            }
            this.rooms[i].doors[0] = [];
        }
        for (let i = 0; i < this.roomAmountY * this.roomAmountX; i += this.roomAmountX) {
            for (let j = 1; j < this.roomSize + 1; j++) {
                this.rooms[i].walls[3][j].changeType(3);
            }
            this.rooms[i].doors[3] = [];
        }
        for (let i = (this.roomAmountX - 1); i < this.roomAmountX * this.roomAmountY; i += this.roomAmountX) {
            for (let j = 1; j < this.roomSize + 1; j++) {
                this.rooms[i].walls[1][j].changeType(4);
            }
            this.rooms[i].doors[1] = [];
        }
        for (let i = this.roomAmountX * (this.roomAmountY - 1); i < this.roomAmountX * this.roomAmountY; i++) {
            console.log(i);
            for (let j = 1; j < this.roomSize + 1; j++) {
                this.rooms[i].walls[2][j].changeType(2);
            }
            this.rooms[i].doors[2] = [];
        }
    }

    randomizeRoomSizes() {
        let scale = 5;
        console.log(this.randomlevel);
        if (this.randomlevel == 1) {
            scale = 5;
        } else if (this.randomlevel == 2) {
            scale = 4;
        } else if (this.randomlevel == 3) {
            scale = 3;
        } else if (this.randomlevel == 4) {
            scale = 2;
        }
        console.log(scale);
        for (let j = 0; j < this.rooms.length; j++) {
            let mX = getRandomIntInclusive(0, this.roomSize / scale);
            for (let i = 0; i < mX; i++) {
                this.rooms[j].deleteColumn();
            }

        }
        for (let j = 0; j < this.rooms.length; j++) {
            let mX = getRandomIntInclusive(0, this.roomSize / scale);
            for (let i = 0; i < mX; i++) {
                this.rooms[j].deleteRow();
            }

        }
    }
}


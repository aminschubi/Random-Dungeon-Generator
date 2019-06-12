import { GameMap } from './game-map';
import { getRandomIntInclusive, Block } from './block';

export class Room {
    public blocks: Block[] = [];
    public walls: Block[][] = [
        [], //Top-Wall
        [], //Right-Wall
        [], //Bottom-Wall
        [] //Left-Wall
    ];
    public doors: Block[][] = [
        [], //Top-Wall Spaces
        [], //Right-Wall Spaces
        [], //Bottom-Wall Spaces
        [] //Left-Wall Spaces
    ];
    public internIndexMap: Array<Block>;
    public topLeftIndex: number;
    public outerSize: number;
    private innerSizeNew = [0, 0];

    constructor(
        public map: GameMap,
        public innerTopLeftBIndex: number,
        public innerSize: number,
        public indexOnMap: number) {
        this.innerSizeNew = [innerSize, innerSize];
        this.internIndexMap = new Array(this.innerSize * this.innerSize);
        this.topLeftIndex = this.innerTopLeftBIndex - this.map.totalBlocksX - 1;
        this.outerSize = this.innerSize + 2;

        this.build();
    }

    build() {
        //!build up the inner room
        var index = this.innerTopLeftBIndex;
        var internIndex = 0;
        var nextRowIndex = this.innerTopLeftBIndex + this.map.totalBlocksX;
        for (let i = 0; i < this.innerSize; ++i) {
            for (let j = 0; j < this.innerSize; ++j) {
                this.internIndexMap[internIndex] = this.map.blocks[index];
                this.internIndexMap[internIndex].changeType(0);
                internIndex++;
                index++;
            }
            index = nextRowIndex;
            nextRowIndex += this.map.totalBlocksX;
        }

        //!indexes of blocks to start building walls
        var wallIndexTop = this.innerTopLeftBIndex - this.map.totalBlocksX - 1;
        var wallIndexLeft = this.innerTopLeftBIndex - this.map.totalBlocksX - 1;
        var wallIndexRight = this.innerTopLeftBIndex - this.map.totalBlocksX + this.map.roomSize;
        var wallIndexBottom = this.innerTopLeftBIndex + this.map.totalBlocksX * (this.innerSize) - 1;
        //!fill wall arrays with the corresponding blocks around the room
        for (let i = 0; i <= this.innerSize + 1; i++) {
            this.walls[0].push(this.map.blocks[wallIndexTop]);
            wallIndexTop++;

            this.walls[1].push(this.map.blocks[wallIndexRight]);
            wallIndexRight += this.map.totalBlocksX;

            this.walls[2].push(this.map.blocks[wallIndexBottom]);
            wallIndexBottom++;

            this.walls[3].push(this.map.blocks[wallIndexLeft]);
            wallIndexLeft += this.map.totalBlocksX;
        }
        //!change their types to corresponding wall types
        for (let j = 1; j < this.innerSize + 1; j++) {
            this.walls[0][j].changeType(1);
            this.walls[1][j].changeType(4);
            this.walls[2][j].changeType(2);
            this.walls[3][j].changeType(3);
        }
        //!get a random index from every wall and make it a door + Corner Pieces
        let x = getRandomIntInclusive(1, this.innerSize);
        this.walls[0][x].changeType(0);
        this.doors[0].push(this.walls[2][x]);
        this.walls[0][0].changeType(5);
        this.walls[0][this.outerSize - 1].changeType(6);
        x = getRandomIntInclusive(1, this.innerSize);
        this.walls[1][x].changeType(0);
        this.doors[1].push(this.walls[1][x]);
        this.walls[1][0].changeType(6);
        this.walls[1][this.innerSize + 1].changeType(8);
        x = getRandomIntInclusive(1, this.innerSize);
        this.walls[2][x].changeType(0);
        this.doors[2].push(this.walls[2][x]);
        this.walls[2][0].changeType(7);
        this.walls[2][this.innerSize + 1].changeType(8);
        x = getRandomIntInclusive(1, this.innerSize);
        this.walls[3][x].changeType(0);
        this.doors[3].push(this.walls[2][x]);
        this.walls[3][0].changeType(5);
        this.walls[3][this.innerSize + 1].changeType(7);



        //!fill this.blocks array with all blocks currently belonging to room including walls
        //!with right indexing
        this.walls[0].forEach(element => {
            this.blocks.push(element);
        });
        for (let j = 0; j < this.innerSize; j++) {
            this.blocks.push(this.walls[3][j + 1]);
            for (let i = 0; i < this.innerSize; i++) {
                this.blocks.push(this.internIndexMap[i + this.innerSize * j]);
            }
            this.blocks.push(this.walls[1][j + 1]);
        }
        this.walls[2].forEach(element => {
            this.blocks.push(element);
        });

        //this.printRoom();
    }

    moveBy(x: number, y: number) {
        //!move blocks x Blocks right and y Blocks down
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            let newIndex = this.blocks[i].indexOnMap + x + (y * this.map.totalBlocksX);
            this.map.blocks[newIndex].changeType(this.blocks[i].type);
            this.map.blocks[this.blocks[i].indexOnMap].changeType(10);
        }
        //!adjust this rooms block array with blocks at new position
        for (let j = 0; j < this.blocks.length; j++) {
            this.blocks[j] = this.map.blocks[this.blocks[j].indexOnMap + x + (y * this.map.totalBlocksX)];
        }
        //!Adjust topLeftIndex(outside top left corner) and innerTopLeftBIndex(inside top left corner)
        this.topLeftIndex += x + y * this.map.totalBlocksX;
        this.innerTopLeftBIndex += x + y * this.map.totalBlocksX;
        //!rebuild Walls around room
        this.rebuild();
        //this.printRoom();
    }

    buildCorridorsNew() {
        //! Check for Top Neighbour
        if (this.map.rooms[this.indexOnMap - this.map.roomAmountX] != undefined) {
            let topNeighbour = this.map.rooms[this.indexOnMap - this.map.roomAmountX];
            let bWall = topNeighbour.walls[2];
            let bDoorDistanceToWall = 10000000;
            let bDoorIndex = 10000000;
            //!find door in bottom-wall of top neighbour,
            //!and check its distance to top edge by % its indexOnMap with totalBlocksX
            for (let i = 0; i < bWall.length; i++) {
                if (bWall[i].type == 0) {
                    bDoorDistanceToWall = bWall[i].indexOnMap % this.map.totalBlocksX;
                    bDoorIndex = bWall[i].indexOnMap;
                    break;
                }
            }
            //!find door in top-wall of this,
            //!and check its distance to top edge by % its indexOnMap with totalBlocksX
            let tDoorDistanceToWall = 10000000;
            let tDoorIndex = 100000000;
            for (let i = 0; i < this.walls[0].length; i++) {
                if (this.walls[0][i].type == 0) {
                    tDoorDistanceToWall = this.walls[0][i].indexOnMap % this.map.totalBlocksX;
                    tDoorIndex = this.walls[0][i].indexOnMap;
                    break;
                }
            }

            if (!(tDoorDistanceToWall == 10000000 || bDoorDistanceToWall == 10000000)) {
                //!dx = distance between both doors horizontally
                let dx = -(tDoorDistanceToWall - bDoorDistanceToWall);
                //!distance = distance between both doors vertically
                let distance = Math.round((tDoorIndex - (bDoorIndex + dx)) / this.map.totalBlocksX - 1);
                //!halfway = half the vertical distance to door+1 (So corridors with odd distances get the right turns in the middle)
                let halfway = Math.ceil(distance / 2);
                let n = 1;
                //!build corridor halfway vertically
                for (n; n < halfway + 1; n++) {
                    this.map.blocks[tDoorIndex - n * this.map.totalBlocksX].changeType(0);
                }
                //!build corridor horrizontaly with length dx (which also gives it its direction +/-)
                let newIndex = tDoorIndex - (n - 1) * this.map.totalBlocksX;
                if (dx > 0) {
                    for (let z = dx; z > 0; z--) {
                        this.map.blocks[newIndex + z].changeType(0);
                    }
                } else if (dx < 0) {
                    for (let z = dx; z < 0; z++) {
                        this.map.blocks[newIndex + z].changeType(0);
                    }
                }
                //!finish corridor by building corridor vertically until it reaches top-neighbours bottom door
                newIndex += dx;
                for (let m = 1; m < distance + 1 - halfway; m++) {
                    this.map.blocks[newIndex - m * this.map.totalBlocksX].changeType(0);
                }
            }

        }
        //! Check for Left Neighbour
        if (this.map.rooms[this.indexOnMap - 1] != undefined && !(this.indexOnMap % this.map.roomAmountX == 0)) {
            let leftNeighbour = this.map.rooms[this.indexOnMap - 1];
            let rWall = leftNeighbour.walls[1];
            let rWallDistanceToWall = 10000000;
            let rWallIndex = 10000000;
            //!find door in right-wall of left neighbour,
            //!and check its distance to left edge by dividing its indexOnMap with totalBlocksX
            for (let i = 0; i < rWall.length; i++) {
                if (rWall[i].type == 0) {
                    rWallDistanceToWall = Math.floor(rWall[i].indexOnMap / this.map.totalBlocksX);
                    rWallIndex = rWall[i].indexOnMap;
                    break;
                }
            }
            //!find door in left-wall of this,
            //!and check its distance to top edge by / its indexOnMap with totalBlocksX
            let lDoorDistanceToWall = 10000000;
            let lDoorIndex = 100000000;
            for (let i = 0; i < this.walls[3].length; i++) {
                if (this.walls[3][i].type == 0) {
                    lDoorDistanceToWall = Math.floor(this.walls[3][i].indexOnMap / this.map.totalBlocksX);
                    lDoorIndex = this.walls[3][i].indexOnMap;
                    break;
                }
            }

            if (!(lDoorDistanceToWall == 10000000 || rWallDistanceToWall == 10000000)) {
                //!dy = distance between both doors vertically
                let dy = -(lDoorDistanceToWall - rWallDistanceToWall);
                //!distance = distance between both doors horizontally
                let distance = Math.round((lDoorIndex - (rWallIndex - dy * this.map.totalBlocksX)) - 1);
                //!halfway = (half the horizontal distance to door) + 1 | So corridors with odd distances get the right turns in the middle
                let halfway = Math.ceil(distance / 2);
                //!build corridor halfway horizontally
                let n = 1;
                for (n; n < halfway + 1; n++) {
                    this.map.blocks[lDoorIndex - n].changeType(0);
                }
                //!build corridor vertically with length dy (which also gives it its direction +/-)
                let newIndex = lDoorIndex - (n - 1);
                if (dy > 0) {
                    for (let z = dy; z > 0; z--) {
                        this.map.blocks[newIndex + z * this.map.totalBlocksX].changeType(0);
                    }
                } else if (dy < 0) {
                    for (let z = dy; z < 0; z++) {
                        this.map.blocks[newIndex + z * this.map.totalBlocksX].changeType(0);
                    }
                }
                //!finish corridor by building corridor horizontally until it reaches left-neighbours right door
                newIndex += dy * this.map.totalBlocksX;
                for (let m = 1; m < distance + 1 - halfway; m++) {
                    this.map.blocks[newIndex - m].changeType(0);
                }
                //this.printRoom();
            }
        }
    }

    rebuild() {
        //!Clear walls and door array
        this.walls.forEach(wall => {
            wall.length = 0;
        });
        this.doors = [[], [], [], []];

        //!Rebuild the Inner Room
        var index2 = this.innerTopLeftBIndex;
        var internIndex = 0;
        var nextRowIndex = this.innerTopLeftBIndex + this.map.totalBlocksX;
        for (let i = 0; i < this.innerSizeNew[1]; ++i) {
            for (let j = 0; j < this.innerSizeNew[0]; ++j) {
                this.internIndexMap[internIndex] = this.map.blocks[index2];
                this.internIndexMap[internIndex].changeType(0);
                internIndex++;
                index2++;
            }
            index2 = nextRowIndex;
            nextRowIndex += this.map.totalBlocksX;
        }

        //!set index and start refilling top-wall and door array perhaps with changed InnerSize
        var wallIndexTop = this.topLeftIndex;
        for (let i = 0; i <= this.innerSizeNew[0] + 1; i++) {
            this.walls[0].push(this.map.blocks[wallIndexTop]);
            if (this.map.blocks[wallIndexTop].type == 0 && i > 0 && i < this.innerSizeNew[0] + 1) {
                this.doors[0].push(this.map.blocks[wallIndexTop]);
            }
            wallIndexTop++;
        }
        //!set index and start refilling left-wall and door array perhaps with changed InnerSize
        var wallIndexLeft = this.topLeftIndex;
        for (let i = 0; i <= this.innerSizeNew[1] + 1; i++) {
            this.walls[3].push(this.map.blocks[wallIndexLeft]);
            if (this.map.blocks[wallIndexLeft].type == 0 && i > 0 && i < this.innerSizeNew[1] + 1) {
                this.doors[3].push(this.map.blocks[wallIndexLeft]);
            }
            wallIndexLeft += this.map.totalBlocksX;
        }
        //!set index and start refilling right-wall and door array perhaps with changed InnerSize
        var wallIndexRight = this.topLeftIndex + this.innerSizeNew[0] + 1;
        for (let i = 0; i <= this.innerSizeNew[1] + 1; i++) {
            this.walls[1].push(this.map.blocks[wallIndexRight]);
            if (this.map.blocks[wallIndexRight].type == 0 && i > 0 && i < this.innerSizeNew[1] + 1) {
                this.doors[1].push(this.map.blocks[wallIndexRight]);
            }
            wallIndexRight += this.map.totalBlocksX;
        }
        //!set index and start refilling bottom-wall and door array perhaps with changed InnerSize
        var wallIndexBottom = this.topLeftIndex + ((this.innerSizeNew[1] + 1) * this.map.totalBlocksX);
        for (let i = 0; i <= this.innerSizeNew[0] + 1; i++) {
            this.walls[2].push(this.map.blocks[wallIndexBottom]);
            if (this.map.blocks[wallIndexBottom].type == 0 && i > 0 && i < this.innerSizeNew[0] + 1) {
                this.doors[2].push(this.map.blocks[wallIndexBottom]);
            }
            wallIndexBottom++;
        }

        this.blocks = [];
        //!fill this.blocks array with all blocks currently belonging to room including walls
        //!with right indexing
        this.walls[0].forEach(element => {
            this.blocks.push(element);
        });
        for (let j = 0; j < this.innerSizeNew[1]; j++) {
            this.blocks.push(this.walls[3][j + 1]);
            for (let i = 0; i < this.innerSizeNew[0]; i++) {
                this.blocks.push(this.internIndexMap[i + this.innerSize * j]);
            }
            this.blocks.push(this.walls[1][j + 1]);
        }
        this.walls[2].forEach(element => {
            this.blocks.push(element);
        });
    }

    deleteColumn() {
        //!Check for door in top wall
        let doorTop = 0;
        this.walls[0].forEach((block, index) => {
            if (this.walls[0][index].type == 0) {
                doorTop = index;
            }
        });
        //!Check for door in bottom wall
        let doorBottom = 0;
        this.walls[2].forEach((block, index) => {
            if (this.walls[2][index].type == 0) {
                doorBottom = index;
            }
        });
        //!Choose column to delete; Repeat if column has a door in it
        let columnZ = getRandomIntInclusive(1, this.innerSizeNew[0]);
        while (columnZ == doorTop || columnZ == doorBottom) {
            columnZ = getRandomIntInclusive(1, this.innerSizeNew[0]);
        }
        //!Get top block in Room in chosen column, and fill array with all blocks in column
        let index = this.blocks[columnZ].indexOnMap;
        let column = [];
        for (let i = 0; i < this.innerSizeNew[1] + 2; i++) {
            column.push(this.map.blocks[index + i * this.map.totalBlocksX]);
        }
        //!Change blocks in column to not-set
        column.forEach((block) => {
            block.changeType(10);
        })

        //!Change type of blocks in column to those of right neighbour; 
        //!Repeat until last column is reached
        for (let j = columnZ; j < this.innerSizeNew[0] + 1; j++) {
            for (let i = 0; i < this.innerSizeNew[1] + 2; i++) {
                column[i].changeType(this.map.blocks[column[i].indexOnMap + 1].type);
                this.map.blocks[column[i].indexOnMap + 1].changeType(10)
                column[i] = this.map.blocks[column[i].indexOnMap + 1];
            }
        }
        //!Remove removed blocks from wall arrays
        this.walls[0].splice(columnZ, 1);
        this.walls[2].splice(columnZ, 1);
        //!Set new InnerSize.X -= 1 and rereference walls
        this.innerSizeNew[0] = this.innerSizeNew[0] - 1;
        this.rebuild();
    }

    deleteRow() {
        //!Check for door in left wall
        let doorTop = 0;
        this.walls[3].forEach((block, index) => {
            if (this.walls[3][index].type == 0) {
                doorTop = index;
            }
        });
        //!Check for door in right wall
        let doorBottom = 0;
        this.walls[1].forEach((block, index) => {
            if (this.walls[1][index].type == 0) {
                doorBottom = index;
            }
        });
        //!Choose row to delete; Repeat if row has a door in it
        let rowZ = getRandomIntInclusive(1, this.innerSizeNew[1]);
        while (rowZ == doorTop || rowZ == doorBottom) {
            rowZ = getRandomIntInclusive(1, this.innerSizeNew[1]);
        }

        //!Get top block in Room in chosen row, and fill array with all blocks in row
        let index = this.blocks[rowZ * (this.innerSizeNew[0] + 2)].indexOnMap;

        let row: Block[] = [];
        for (let i = 0; i < this.innerSizeNew[0] + 2; i++) {
            row.push(this.map.blocks[index + i]);
        }

        //!Change blocks in row to not-set
        row.forEach((block) => {
            block.changeType(10);
        })

        //!Change type of blocks in row to those of bottom neighbour; 
        //!Repeat until last row is reached
        for (let j = rowZ; j < this.innerSizeNew[1] + 1; j++) {

            for (let i = 0; i < this.innerSizeNew[0] + 2; i++) {
                row[i].changeType(this.map.blocks[row[i].indexOnMap + this.map.totalBlocksX].type);
                this.map.blocks[row[i].indexOnMap + this.map.totalBlocksX].changeType(10)
                row[i] = this.map.blocks[row[i].indexOnMap + this.map.totalBlocksX];
            }
        }
        //!Remove removed blocks from wall arrays
        this.walls[1].splice(rowZ, 1);
        this.walls[3].splice(rowZ, 1);
        //!Set new InnerSize.X -= 1 and rereference walls
        this.innerSizeNew[1] = this.innerSizeNew[1] - 1;

        this.rebuild();
    }

    printRoom() {
        let roomAsString = ``;
        this.blocks.forEach((block, index) => {
            roomAsString += `| ${block.type} |`;
            if ((index + 1) % (this.innerSizeNew[0] + 2) == 0) {
                roomAsString += `\n`
            }
        });
        console.log(roomAsString);
    }
}
import { Point } from "./game-map"
export class Block {
    public type: number;
    public x: number;
    public y: number;
    constructor(public position: Point, public indexOnMap: number, blockToCopy?: any) {
        this.x = position.x;
        this.y = position.y;

        if (blockToCopy instanceof Block)
            this.type = blockToCopy.type;
        else
            this.type = 10;

        this.changeType(this.type);
    }

    changeType(type: number) {
        this.type = type;
    }
}



export function getRandomIntInclusive(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
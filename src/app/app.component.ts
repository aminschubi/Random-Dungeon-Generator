import { Component, ViewChild, ElementRef } from '@angular/core';
import { GameMap } from "../map/game-map"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'angular-electron';
  openMap: GameMap = null;
  ngAfterViewInit() {
  }

  createMap(roomSize: number, roomAmountX: number, roomAmountY: number, roomSpreadX: number, roomSpreadY: number, randomize: boolean, randomizeValue: number | 0) {
    this.openMap = new GameMap(roomAmountX, roomAmountY, roomSize, roomSpreadX, roomSpreadY, randomize, randomizeValue);
  }

  handleClick(event: Event) {
    if (this.openMap != null) {
      this.openMap.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.openMap.ctx.clearRect(0, 0, this.openMap.canvas.width, this.openMap.canvas.height);
    }
    //@ts-ignorew
    let roomSize = +document.getElementById("roomsize").value;
    //@ts-ignore
    let roomAmountX = +document.getElementById("roomAmountX").value;
    //@ts-ignore
    let roomAmountY = +document.getElementById("roomAmountY").value;
    //@ts-ignore
    let roomSpreadX = +document.getElementById("roomSpreadX").value;
    //@ts-ignore
    let roomSpreadY = +document.getElementById("roomSpreadY").value;
    //@ts-ignore
    let randomize = document.getElementById("randomize").checked;
    //@ts-ignore
    let randlevel = document.getElementById("randlevel").value;

    this.createMap(roomSize, roomAmountX, roomAmountY, roomSpreadX, roomSpreadY, randomize, randlevel);
  }

  clearClick(event: Event) {
    if (this.openMap != null) {
      this.openMap.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.openMap.ctx.clearRect(0, 0, this.openMap.canvas.width, this.openMap.canvas.height);
    }
  }

  exportClick(event: Event) {
    let json = "{ \n \t \"maplength\":";
    let tiles = this.openMap.tiles;
    json += tiles.length + "\n \t";
    tiles.forEach(tile => {
      let s = JSON.stringify(tile.jsonify());
      json += s;
    });
    json += "\n}";
    console.log(json);
  }
}

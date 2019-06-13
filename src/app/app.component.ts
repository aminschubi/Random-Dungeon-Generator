import { Component, ViewChild, ElementRef } from "@angular/core";
import { GameMap, Point } from "../map/game-map";
import { Block } from "../map/block";
import { ValueTransformer } from '@angular/compiler/src/util';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})

export class AppComponent {
  title = "dungeon-creator";
  openMap: GameMap = null;
  fs: any;
  dialog: any;
  ngAfterViewInit() {
    //@ts-ignore
    this.fs = window.fs;
    //@ts-ignore
    this.dialog = window.dialog;
  }

  createMap(roomSize: number, roomAmountX: number, roomAmountY: number, roomSpreadX: number, roomSpreadY: number, randomize: boolean, randomizeValue: number | 0) {
    this.openMap = new GameMap(roomAmountX, roomAmountY, roomSize, roomSpreadX, roomSpreadY, randomize, randomizeValue);
  }

  handleClick(event: Event) {
    if (this.openMap != null) {
      this.openMap.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.openMap.ctx.clearRect(0, 0, this.openMap.canvas.width, this.openMap.canvas.height);
    }
    //@ts-ignore
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
    let json = "{\n\t\"maplength\":";
    let tiles = this.openMap.tiles;
    json += tiles.length + ",\n\t";
    json += "\"roomAmountX\":" + this.openMap.roomAmountX + ",\n\t";
    json += "\"roomAmountY\":" + this.openMap.roomAmountY + ",\n\t";
    json += "\"totalBlocksX\":" + this.openMap.totalBlocksX + ",\n\t";
    json += "\"totalBlocksY\":" + this.openMap.totalBlocksY + ",\n\t";
    json += "\"xSize\":" + this.openMap.xSize + ",\n\t";
    json += "\"ySize\":" + this.openMap.ySize + ",\n\t";
    json += "\"xMax\":" + this.openMap.xMax + ",\n\t";
    json += "\"yMax\":" + this.openMap.yMax + ",\n\t";
    json += "\"scale\":" + this.openMap.scale + ",\n\t";
    tiles.forEach((tile, index) => {
      json += "\"T" + index + "\":";
      let s = JSON.stringify(tile.jsonify());
      if (index != tiles.length - 1) {
        json += s + ",\n\t";
      } else {
        json += s;
      }
    });
    json += "\n}";
    this.dialog.showSaveDialog((fileName) => {
      if (fileName === undefined) {
        alert("Filename is undefined!");
        return;
      }

      // fileName is a string that contains the path and filename created in the save file dialog.  
      this.fs.writeFile(fileName, json, (error) => {
        if (error) {
          alert("An error ocurred creating the file " + error.message)
        }

        alert(`Map saved to ${fileName}`);
      });
    });
  }

  importClick(event: Event) {
    var blockAmount = 0;
    var roomSX = 0;
    var roomSY = 0;
    var tBX = 0;
    var tBY = 0;
    var xS = 0;
    var yS = 0;
    var s = 0;
    var blocks = [];
    var i = 0;
    var j = 0;
    var indexCounter = 0;
    var blockMapIndex = new Point(0, 0);
    let data = this.fs.readFileSync("./map.json");
    let x = JSON.parse(data);
    for (var key in x) {
      if (x.hasOwnProperty(key)) {
        switch (key) {
          case "maplength":
            blockAmount = x[key];
            break;
          case "roomAmountX":
            roomSX = x[key];
            break;
          case "roomAmountY":
            roomSY = x[key];
            break;
          case "totalBlocksX":
            tBX = x[key];
            break;
          case "totalBlocksY":
            tBY = x[key];
            break;
          case "xSize":
            xS = x[key];
            break;
          case "ySize":
            yS = x[key];
            break;
          case "scale":
            s = x[key];
            break;
        };
        if (key[0] == "T") {
          let index = +key.substring(1, key.length - 1);
          var block = new Block(blockMapIndex, indexCounter);
          block.changeType(x[key].value);
          blocks.push(block);
          blockMapIndex = new Point(blockMapIndex.x + xS, blockMapIndex.y);
          j++;
          if (j >= tBX) {
            blockMapIndex = new Point(0, blockMapIndex.y + yS);
            i++;
            j = 0;
          }
        }
      }
    }

    this.clearClick(event);
    this.openMap = new GameMap(roomSX, roomSY, 0, 0, 0, false, 0, blocks, s, xS, yS);

    //console.log(json.keys());
  }
}

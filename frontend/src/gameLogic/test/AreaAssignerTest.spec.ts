import { Player } from "../Models/Player";
import { Colour } from "../Enums/Colours";
import { AreaAssigner } from "../Controllers/AreaAssigner";
import { AreaType } from "../Models/AreaType";
import { Areas } from "../Enums/Areas";
import { assert } from "chai";
import "mocha";

describe("AreaAssigner", () => {
  let assigner: AreaAssigner;
  let player1: Player;
  let player2: Player;
  let areaLists: Array<AreaType[]>;
  beforeEach(function() {
    player1 = new Player(1, Colour.GREEN);
    player2 = new Player(2, Colour.GREEN);
    areaLists = [[Areas.FANGORN], [Areas.FORLINDON]];

    const players = [player1, player2];
    assigner = new AreaAssigner(players);
  });

  it("should be able to assign an area to a player", () => {
    const beforeCount = player1.getAreas().length;
    assert.equal(beforeCount, 0);

    assigner.assignAreas(areaLists);

    const afterCount = player1.getAreas().length;
    assert.isAbove(afterCount, beforeCount);
  });

  it("should assign areas between players equally", () => {
    assigner.assignAreas(areaLists);
    const player1TotalAreas = player1.getAreas().length;
    const player2TotalAreas = player2.getAreas().length;

    assert.equal(player1TotalAreas, player2TotalAreas);
  });
});

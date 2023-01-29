import { Areas } from "../logic/Enums/Areas";
import { Area } from "../logic/Models/Area";
import { AreaType } from "../logic/Models/AreaType";


export function convertPlayerAreasToString(areas: Array<AreaType[]>): Array<string> {
    const parsedAreas: Array<string> = [];
    for (let i = 0; i < areas.length; i++) {
        let areasString = '';

        for (let j = 0; j < areas[i].length - 1; j++) {
            areasString += `${areas[i][j].getName()}, `;
        }

        areasString += `${areas[i][areas[i].length - 1].getName()}`;
        parsedAreas.push(areasString);
    }

    return parsedAreas;
}

export function getAreas(areaNames: Array<string>) {
    const playerAreas: Array<Array<AreaType>> = [];

    for (let i = 0; i < areaNames.length; i++) {
        const names = areaNames[i]!.split(', ');
        const areas = getAreasByNames(names);
        playerAreas.push(areas);
    }

    return playerAreas;
}

export function getAreasByNames(areaNames: Array<string>): Array<Area> {
    const areas: Array<Area> = [];
    for (let i = 0; i < areaNames.length; i++) {
        const area: AreaType = Areas[areaNames[i]];
        areas.push(area);
    }

    return areas;
}

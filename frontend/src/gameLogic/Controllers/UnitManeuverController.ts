import { AreaType } from '../Models/AreaType';

export class UnitManeuverController {
    private origin: AreaType;
    private destination: AreaType;
    constructor(origin: AreaType, destination: AreaType) {
        this.origin = origin;
        this.destination = destination;
    }

    static isManeuverValid(origin: AreaType, units: number) {
        return units < origin.getUnits() && units > 0;
    }

    moveUnits(units: number) {
        this.origin.removeUnits(units);
        this.destination.addUnits(units);
    }
}
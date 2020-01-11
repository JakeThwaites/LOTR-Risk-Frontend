import { Area } from '../Models/Area';

export class CombatController {

    private attackingArea: Area;
    private defendingArea: Area;
    constructor(attackingArea: Area, defendingArea: Area) {
        this.attackingArea = attackingArea;
        this.defendingArea = defendingArea;
    }

    handleCombat(attackingDiceUsed: number, defendingDiceUsed: number) {
        const attackingDice = this.rollDice(attackingDiceUsed);
        const defendingDice = this.rollDice(defendingDiceUsed);
        
        for (let i = 0; i < defendingDice.length; i++) {
            if (i === 0) {
                this.firstDiceCombat(attackingDice[0], defendingDice[0]);
            } else {
                this.removeUnitsFromLoser(attackingDice[1], defendingDice[1]);
            }
        }
    }

    rollDice(numberOfDice: number): Array<number> {
        let numbersRolled = [];
        for (let i = 0; i < numberOfDice; i++) {
            const number = this.getDiceRoll();
            numbersRolled.push(number); 
        }
        return numbersRolled.sort();
    }

    getDiceRoll(): number {
        const numberRolled = Math.floor(Math.random() * 6) + 1; 
        return numberRolled;
    }

    firstDiceCombat(attackingDice: number, defendingDice: number) {
        const defenderBonus = this.getDefenderDiceBonus(this.defendingArea);
        const attackerBonus = this.getAttackerDiceBonus(this.attackingArea);
        const attackerScore = attackingDice + attackerBonus;
        const defenderScore = defendingDice + defenderBonus;
        this.removeUnitsFromLoser(attackerScore, defenderScore);
    }

    getDefenderDiceBonus(defendingArea: Area): number {
        let bonus = 0;
        if (defendingArea.getIsStronghold()) {
            bonus += 1;
        }
        if (defendingArea.getHasLeader()) {
            bonus += 1;
        }
        return bonus;
    }

    getAttackerDiceBonus(attackingArea: Area): number {
        let bonus = 0;
        if (attackingArea.getHasLeader()) {
            bonus += 1;
        }
        return bonus;
    }

    removeUnitsFromLoser(attackingRoll: number, defendingRoll: number) {
        if (defendingRoll >= attackingRoll) {
            const attackingPlayer = this.attackingArea.getPlayer();
            if (attackingPlayer !== null) {
                attackingPlayer.removeUnits(1);
                this.attackingArea.removeUnits(1);
            }
        } else {
            const defendingPlayer = this.defendingArea.getPlayer();
            if (defendingPlayer !== null) {
                defendingPlayer.removeUnits(1);
                this.defendingArea.removeUnits(1);
            }
        }
    }
}
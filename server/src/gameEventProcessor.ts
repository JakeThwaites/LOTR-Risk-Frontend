import { WebSocketServer } from "ws";
import { getAreas } from "./gameLogic/Enums/Areas";
import { Game } from "./gameLogic/Models/Game";
import { broadcastMessage } from "./webSockets";
import { CombatController } from "./gameLogic/Controllers/CombatController";
import { AreaType } from "./gameLogic/Models/AreaType";
import { UnitMoveController } from "./gameLogic/Controllers/UnitMoveController";
import GameEventMessageFactory, { GameEventType } from "./GameEventMessageFactory";
import { WebSocketManager } from "./WebSocketManager";
import { AreaName } from "./gameLogic/Enums/AreaNames";

export function updateGame(messageData: any, game: Game, wss: WebSocketServer, webSocketManager: WebSocketManager): void {
    let currentPlayer = game.getCurrentPlayer();
    const gameAreas = game.getAreas();
    
    // TODO: don't do this if player joined or disconnected message
    if (currentPlayer.getUserID() !== messageData.userID && messageData.type !== GameEventType.PLAYER_JOINED) {
        console.log("message sent from incorrect player");
        return;
    }

    switch (messageData.type) {
        case GameEventType.STARTING_REINFORCEMENT: {
            const area = gameAreas[messageData.areaName as AreaName];
            
            currentPlayer.addReinforcementsToArea(area);
            const areaUpdateMessage = GameEventMessageFactory.generateAreaUpdateMessage(area);
            broadcastMessage(areaUpdateMessage, wss);

            if (currentPlayer.getReinforcements() < 1) {
                game.changeCurrentPlayer();
                currentPlayer = game.getCurrentPlayer();
                const changePlayerMessage = GameEventMessageFactory.generateChangePlayerMessage(currentPlayer.getColour());
                broadcastMessage(changePlayerMessage, wss);
            }

            const reinforcementsAvailable = currentPlayer.getReinforcements();
            const reinforcementsAvailableMessage = GameEventMessageFactory.generateReinforcementsAvailableMessage(reinforcementsAvailable);
            broadcastMessage(reinforcementsAvailableMessage, wss);

            if (!game.playersHaveReinforcements()) {
                const endOfStartingReinforcementsMessage = GameEventMessageFactory.generateEndOfStartingReinforcementsMessage();
                broadcastMessage(endOfStartingReinforcementsMessage, wss);
            }
            
            break;
        }
        case GameEventType.REINFORCEMENT: {
            const area = gameAreas[messageData.areaName as AreaName];
            currentPlayer.addReinforcementsToArea(area);
            const reinforcementUpdateMessage = GameEventMessageFactory.generateReinforcementUpdateMessage(messageData.areaName);
            broadcastMessage(reinforcementUpdateMessage, wss);

            const reinforcementsAvailable = currentPlayer.getReinforcements();
            const reinforcementsAvailableMessage = GameEventMessageFactory.generateReinforcementsAvailableMessage(reinforcementsAvailable);
            broadcastMessage(reinforcementsAvailableMessage, wss);
            break;
        }
        case GameEventType.END_TURN: {
            const previousCurrentPlayer = game.getCurrentPlayer();
            game.handleNewTurn();

            const territoryCardMessage = GameEventMessageFactory.generateTerritoryCardMessage(previousCurrentPlayer);
            webSocketManager.messageIndividualClient(game.getUUID(), previousCurrentPlayer.getUserID(), territoryCardMessage);

            const newCurrentPlayer = game.getCurrentPlayer();
            const endTurnMessage = GameEventMessageFactory.generateEndTurnMessage(newCurrentPlayer.getColour());
            broadcastMessage(endTurnMessage, wss);

            const reinforcementsAvailable = newCurrentPlayer.getReinforcements();
            const reinforcementsAvailableMessage = GameEventMessageFactory.generateReinforcementsAvailableMessage(reinforcementsAvailable);
            broadcastMessage(reinforcementsAvailableMessage, wss);

            if (game.areMaxTurnsReached()) {
                const gameOverMessage = GameEventMessageFactory.generateGameOverMessage();
                broadcastMessage(gameOverMessage, wss);
            }

            break;
        }
        case GameEventType.CLEAR_SELECTED_AREAS: {
            const message = GameEventMessageFactory.generateClearSelectedAreasMessage();
            broadcastMessage(message, wss);
            break;
        }
        case GameEventType.COMBAT: {
            const attackingArea = gameAreas[messageData.attackingArea as AreaName];
            const defendingArea = gameAreas[messageData.defendingArea as AreaName];
            const combatController = new CombatController(
                attackingArea,
                defendingArea,
                game!
            );
            const results = combatController.getCombatResults(messageData.numAttackingDice);
            combatController.handleResults(results);

            const combatResultsMessage = GameEventMessageFactory.generateCombatResultsMessage(attackingArea, defendingArea);
            broadcastMessage(combatResultsMessage, wss);

            if (defendingArea.hasNoUnitsRemaining()) {
                const message = GameEventMessageFactory.generateUnitMoveSetupMessage(attackingArea, defendingArea);
                broadcastMessage(message, wss);
            }
            break;
        }
        case GameEventType.UNIT_MOVE: {
            const origin = gameAreas[messageData.origin as AreaName];
            const destination = gameAreas[messageData.destination as AreaName];
            handleUnitMove(origin, destination, messageData.numUnits);

            const originUpdateMessage = GameEventMessageFactory.generateAreaUpdateMessage(origin);
            const destinationUpdateMessage = GameEventMessageFactory.generateAreaUpdateMessage(destination);
            broadcastMessage(originUpdateMessage, wss);
            broadcastMessage(destinationUpdateMessage, wss);

            const unitMoveCompleteMessage = GameEventMessageFactory.generateUnitMoveCompleteMessage();
            broadcastMessage(unitMoveCompleteMessage, wss);
            break;
        }
        case GameEventType.TROOP_TRANSFER_SETUP: {
            const message = GameEventMessageFactory.generateTroopTransferMessage();
            broadcastMessage(message, wss);
            break;
        }
        case GameEventType.TROOP_TRANSFER: {
            const origin = gameAreas[messageData.origin as AreaName];
            const destination = gameAreas[messageData.destination as AreaName];
            handleUnitMove(origin, destination, messageData.numUnits);

            const originUpdateMessage = GameEventMessageFactory.generateAreaUpdateMessage(origin);
            const destinationUpdateMessage = GameEventMessageFactory.generateAreaUpdateMessage(destination);
            broadcastMessage(originUpdateMessage, wss);
            broadcastMessage(destinationUpdateMessage, wss);

            const troopTransferCompleteMessage = GameEventMessageFactory.generateTroopTransferCompleteMessage();
            broadcastMessage(troopTransferCompleteMessage, wss);
            break;
        }
        case GameEventType.PLAYER_JOINED: {
            break;
        }
        case GameEventType.PLAYER_DISCONNECT: {
            break;
        }
        case GameEventType.GAME_OVER_DISCONNECT: {
            const gameOverMessage = GameEventMessageFactory.generateGameOverMessage();
            broadcastMessage(gameOverMessage, wss);
            break;
        }
        default: {
            break;
        }
    }
}

function handleUnitMove(origin: AreaType, destination: AreaType, numUnits: number): void {
    const unitMoveController = new UnitMoveController(
        origin,
        destination
    );

    unitMoveController.moveUnits(numUnits);
}
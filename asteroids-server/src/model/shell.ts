import {COLLISION_DISTANCE, MAX_SPEED} from "../constants";
import {log} from "../logger";
import {ShipRBush} from "../server";
import {Ship} from "./ship";
import {Vector} from "./vector";
import Victor = require("victor");

export interface Shell {
  owner: string,
  bearing: number,
  position: Vector,
  velocity: number,
  ttl: number,
}

export const newShell: (s: Ship) => Shell = ship => {
  const shellVector = new Victor(MAX_SPEED*2, 0).rotate(ship.bearing).add(new Victor(ship.velocity.x, ship.velocity.y))
  const shellPosition = new Victor(COLLISION_DISTANCE, 0).rotate(ship.bearing).add(new Victor(ship.position.x, ship.position.y))
  return {
    owner: ship.id,
    bearing: ship.bearing,
    position: { x: shellPosition.x, y: shellPosition.y },
    velocity: shellVector.length(),
    ttl: 100,
  }
}

export const recalculateShells: (shells: Shell[], ships: Ship[], shipsTree: ShipRBush) => Shell[] = (shells, ships, shipsTree) => {
  for(const shell of shells.values()) {
    const shellPosition = new Victor(shell.velocity, 0).rotate(shell.bearing).add(new Victor(shell.position.x, shell.position.y))
    shell.position.x = shellPosition.x
    shell.position.y = shellPosition.y
    shell.ttl -= 1;
    const v1 = new Victor(shellPosition.x, shellPosition.y)
    const collide = shipsTree.search({
      minX: shell.position.x - COLLISION_DISTANCE/2,
      maxX: shell.position.x + COLLISION_DISTANCE/2,
      minY: shell.position.y - COLLISION_DISTANCE/2,
      maxY: shell.position.y + COLLISION_DISTANCE/2,
    }).filter(s => v1.distance(new Victor(s.position.x, s.position.y)) < COLLISION_DISTANCE/2)

    if (collide.length > 0) {
      //log.info(`Shell hit ${collide.map(a => a.id)}`)
      shell.ttl = 0
    }
  }
  return shells.filter(s => s.ttl > 0)
}

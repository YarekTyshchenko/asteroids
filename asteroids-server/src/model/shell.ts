import {MAX_SPEED} from "../constants";
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
  return {
    owner: ship.id,
    bearing: ship.bearing,
    position: { x: ship.position.x, y: ship.position.y },
    velocity: shellVector.length(),
    ttl: 100,
  }
}

export const recalculateShells: (shells: Shell[]) => Shell[] = shells => {
  for(const shell of shells.values()) {
    const shellPosition = new Victor(shell.velocity, 0).rotate(shell.bearing).add(new Victor(shell.position.x, shell.position.y))
    shell.position.x = shellPosition.x
    shell.position.y = shellPosition.y
    shell.ttl -= 1;
  }
  return shells.filter(s => s.ttl > 0)
}

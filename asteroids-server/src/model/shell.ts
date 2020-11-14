import {COLLISION_DISTANCE, MAX_SPEED} from "../constants";
import {log} from "../logger";
import {ShipRBush} from "../server";
import {AsteroidRBush} from "./asteroid";
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
  const shipVelocityVector = new Victor(ship.velocity.x, ship.velocity.y)
  const shellShootVelocityVector = new Victor(MAX_SPEED*2, 0).rotate(ship.bearing)
  const shellVector = shellShootVelocityVector.add(shipVelocityVector)

  const shellPosition = new Victor(COLLISION_DISTANCE, 0).rotate(ship.bearing).add(new Victor(ship.position.x, ship.position.y))
  return {
    owner: ship.id,
    bearing: shellVector.direction(),
    position: { x: shellPosition.x, y: shellPosition.y },
    velocity: shellVector.length(),
    ttl: 100,
  }
}

export interface HitShip {
  owner: string
  position: Vector
  target: string
}

export const recalculateShells: (shells: Shell[], shipsTree: ShipRBush, asteroidTree: AsteroidRBush) => { shells: Shell[], hits: HitShip[]} = (shells, shipsTree, asteroidTree) => {
  const hits = []
  for(const shell of shells.values()) {
    const shellPosition = new Victor(shell.position.x, shell.position.y).add(new Victor(shell.velocity, 0).rotate(shell.bearing))
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
      const collisionTarget = collide.sort(((a, b) => {
        const av = new Victor(a.position.x, a.position.y)
        const bv = new Victor(b.position.x, b.position.y)
        return av.distance(shellPosition) - bv.distance(shellPosition)
      })).shift()

      //log.info(`Shell hit ${collide.map(a => a.id)}`)
      hits.push({owner: shell.owner, position: collisionTarget.position, target: collisionTarget.id})
      shell.ttl = 0
    }
    const collide2 = asteroidTree.search({
      maxX: shellPosition.x,
      maxY: shellPosition.y,
      minX: shellPosition.x,
      minY: shellPosition.y,
    }).filter(s => v1.distance(s.position) < s.mass/2)
    if (collide2.length > 0) {
      shell.ttl = 0
      //log.info(`Asteroid hit ${JSON.stringify(collide2)} by ship ${shell.owner}`)
      collide2.forEach(a => {
        if (!a.static) {
          a.hit = true
          hits.push({owner: shell.owner, position: a.position, target: "asteroid"})
        }
      })
    }
  }
  return {
    shells: shells.filter(s => s.ttl > 0),
    hits
  }
}

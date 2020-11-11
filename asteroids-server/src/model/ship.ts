import {COLLISION_DISTANCE, MAX_SPEED} from "../constants";
import {log} from "../logger";
import {ShipRBush} from "../server";
import {Vector} from "./vector";
import Victor = require("victor");

export interface Ship {
  id: string,
  bearing: number,
  position: Vector,
  velocity: Vector,
  thrust: number,
  rotation: number,
}

export const newShip: (id: string, r: number) => Ship = (id, r) => ({
  id,
  bearing: Math.random()*2*Math.PI,
  position: {x: Math.random()*r-r/2, y: Math.random()*r-r/2},
  velocity: {x: 0, y: 0},
  thrust: 0,
  rotation: 0
})

export const recalculateShips = (ships: Map<string, Ship>, shipsTree: ShipRBush) => {
  for(const ship of ships.values()) {
    shipsTree.remove(ship)
    ship.bearing = ship.bearing + ship.rotation
    const shipVelocity = new Victor(ship.velocity.x, ship.velocity.y)

    const thrustVector = new Victor(ship.thrust, 0).rotate(ship.bearing)
    const finalVector = shipVelocity.add(thrustVector)
    const finalBearing = finalVector.angle()
    let finalSpeed = finalVector.length()
    // if (finalSpeed > MAX_SPEED) {
    //   finalSpeed = MAX_SPEED
    // }
    const velocity = new Victor(finalSpeed, 0).rotate(finalBearing)
    ship.velocity.x = velocity.x
    ship.velocity.y = velocity.y

    // check for collision using projected position of the ship using current velocity
    const projectedPosition = new Victor(ship.position.x + ship.velocity.x, ship.position.y + ship.velocity.y)
    const collide = shipsTree.search({
      minX: projectedPosition.x - COLLISION_DISTANCE/2,
      maxX: projectedPosition.x + COLLISION_DISTANCE/2,
      minY: projectedPosition.y - COLLISION_DISTANCE/2,
      maxY: projectedPosition.y + COLLISION_DISTANCE/2,
    }).filter(s => projectedPosition.distance(new Victor(s.position.x, s.position.y)) < COLLISION_DISTANCE)
    if (collide.length > 0) {
      // Process every collision or just the first?
      const collisionTarget = collide.sort(((a, b) => {
        const av = new Victor(a.position.x, a.position.y)
        const bv = new Victor(b.position.x, b.position.y)
        return av.distance(projectedPosition) - bv.distance(projectedPosition)
      })).shift()

      const otherShip = ships.get(collisionTarget.id)!
      const r2 = new Victor(otherShip.position.x, otherShip.position.y)
      const impactVector = r2.subtract(projectedPosition)
      const impactNormal = impactVector.divideScalar(impactVector.length())
      //log.info(`Collision between ${ship.id} and ${otherShip.id}: Impact Vector ${impactVector}, Normal: ${impactNormal}`);

      const v1 = new Victor(ship.velocity.x, ship.velocity.y)
      const v2 = new Victor(otherShip.velocity.x, otherShip.velocity.y)

      // Impact speed in direction of the impact normal
      const impulse = impactNormal.dot(v1.subtract(v2))
      // How much energy is conserved in the impact due to elasticity
      const eps = 0.5
      const v1f = v1.subtract(impactNormal.multiplyScalar(impulse)).multiplyScalar(eps)
      ship.velocity.x = v1f.x
      ship.velocity.y = v1f.y

      const v2f = v2.add(impactNormal.multiplyScalar(impulse)).multiplyScalar(eps)
      otherShip.velocity.x = v2f.x
      otherShip.velocity.y = v2f.y
    } else {
      ship.position.x = ship.position.x + ship.velocity.x
      ship.position.y = ship.position.y + ship.velocity.y
    }
    shipsTree.insert(ship)
  }
}

import {COLLISION_DISTANCE, MAX_SPEED} from "../constants";
import {log} from "../logger";
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

export const newShip: (id: string) => Ship = id => ({
  id,
  bearing: 0,
  position: {x: Math.random()*400-200, y: Math.random()*400-200},
  velocity: {x: 0, y: 0},
  thrust: 0,
  rotation: 0
})

export const recalculateShips = (ships: Map<string, Ship>) => {
  for(const ship of ships.values()) {
    ship.bearing = ship.bearing + ship.rotation
    const shipVelocity = new Victor(ship.velocity.x, ship.velocity.y)

    const thrustVector = new Victor(ship.thrust, 0).rotate(ship.bearing)
    const finalVector = shipVelocity.add(thrustVector)
    const finalBearing = finalVector.angle()
    let finalSpeed = finalVector.length()
    if (finalSpeed > MAX_SPEED) {
      finalSpeed = MAX_SPEED
    }
    const velocity = new Victor(finalSpeed, 0).rotate(finalBearing)
    ship.velocity.x = velocity.x
    ship.velocity.y = velocity.y

    // check for collision
    const v1 = new Victor(ship.position.x + ship.velocity.x, ship.position.y + ship.velocity.y)
    const collide = Array.from(ships.values()).filter(s => {
      return ship.id != s.id && v1.distance(new Victor(s.position.x, s.position.y)) < COLLISION_DISTANCE
    })
    if (collide.length > 0) {
      const otherShip = ships.get(collide[0].id)!
      const r1 = new Victor(ship.position.x, ship.position.y)
      const r2 = new Victor(otherShip.position.x, otherShip.position.y)
      const impactVector = r2.subtract(r1)
      const impactNormal = impactVector.divideScalar(impactVector.length())
      //log.info(`Collision between ${ship.id} and ${otherShip.id}: Impact Vector ${impactVector}, Normal: ${impactNormal}`);

      const v1 = new Victor(ship.velocity.x, ship.velocity.y)
      const v2 = new Victor(otherShip.velocity.x, otherShip.velocity.y)

      const eps = 0.1

      // Impact speed in direction of the impact normal
      const impactSpeed = impactNormal.dot(v1.subtract(v2))
      const impulse = (1 + eps) * impactSpeed
      // log.info(`Initial speed ${v1}`)
      // log.info(`impact speed: ${impactSpeed}, Impulse: ${impulse}`)

      const v1f = v1.subtract(impactNormal.multiplyScalar(impulse))
      ship.velocity.x = v1f.x
      ship.velocity.y = v1f.y
      // log.info(`${ship.id} V: ${[ship.velocity.x, ship.velocity.y]}, P: ${[ship.position.x, ship.position.y]}`)

      const v2f = v2.add(impactNormal.multiplyScalar(impulse))
      otherShip.velocity.x = v2f.x
      otherShip.velocity.y = v2f.y
      otherShip.position.x = otherShip.position.x + otherShip.velocity.x
      otherShip.position.y = otherShip.position.y + otherShip.velocity.y
    }
    ship.position.x = ship.position.x + ship.velocity.x
    ship.position.y = ship.position.y + ship.velocity.y
  }
}

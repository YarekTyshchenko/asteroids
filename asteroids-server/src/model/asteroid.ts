import Victor = require("victor");
import RBush from "rbush";
import {log} from "../logger";
import {HitShip} from "./shell";

export interface Asteroid {
  position: Victor
  velocity: Victor
  static: boolean
  mass: number
  hit: boolean
}
export class AsteroidRBush extends RBush<Asteroid> {
  toBBox(s: Asteroid) { return { minX: s.position.x-s.mass/2, minY: s.position.y-s.mass/2, maxX: s.position.x+s.mass/2, maxY: s.position.y+s.mass/2 }; }
  compareMinX(a: Asteroid, b: Asteroid) { return a.position.x-a.mass/2 - b.position.x-b.mass/2; }
  compareMinY(a: Asteroid, b: Asteroid) { return a.position.y-a.mass/2 - b.position.y-b.mass/2; }
}

const randomVictor = (n: number = 1000) => {
  return new Victor(Math.random()*n-n/2, Math.random()*n-n/2)
}

export const createAsteroid = (asteroidTree: AsteroidRBush) => {
  const f = new Victor(Math.random()*500+500, 0).rotate(Math.random()*2*Math.PI)
  const newRoid = () => ({static: false, hit: false, mass: Math.random()*90+10, position: f, velocity: randomVictor(2)})
  let collide: boolean
  let roid: Asteroid
  do {
    roid = newRoid()
    collide = asteroidTree.collides({
      maxX: roid.position.x+roid.mass/2,
      maxY: roid.position.y+roid.mass/2,
      minX: roid.position.x-roid.mass/2,
      minY: roid.position.y-roid.mass/2
    })
  } while(collide)
  return roid
}

const randomPositionWithinRadius = (position: Victor, radius: number): Victor => {
  const pos = position.clone()
  const f = new Victor(radius/2, 0).rotate(Math.random()*2*Math.PI)
  pos.add(f)
  return pos
}

const splitRoid = (roid: Asteroid, asteroidTree: AsteroidRBush): Asteroid[] => {
  // Split it
  const chunks = 3
  let i = 0
  let roids = new Array<Asteroid>()
  while(i++ < chunks) {
    const mass = roid.mass / chunks
    if (mass < 10) continue
    let ok = false
    let r: Asteroid
    do {
      r = {
        static: false,
        hit: false,
        mass: mass,
        position: randomPositionWithinRadius(roid.position, roid.mass),
        velocity: randomVictor(0.2).add(roid.velocity)
      }
      // Check if it fits
      ok = !roids.find(s => s.position.distance(r.position) < s.mass + r.mass)
    } while(!ok)
    roids.push(r)
  }
  return roids
}

export const recalculateAsteroids = (asteroids: Asteroid[], asteroidTree: AsteroidRBush) => {
  const hits = new Array<HitShip>()
  for (const roid of asteroids.values()) {
    if (roid.static) continue
    asteroidTree.remove(roid)
    if (roid.hit) {
      const chunks = splitRoid(roid, asteroidTree)
      chunks.forEach(c => {
        asteroids.push(c)
        asteroidTree.insert(c)
      })
      // Skip processing
      continue
    }
    const gravity = roid.position.clone().invert().normalize()
    const distance = roid.position.distance(new Victor(0, 0))
    roid.velocity.add(gravity.multiplyScalar(1/distance))
    const projectedPosition = roid.position.clone().add(roid.velocity)
    const collide = asteroidTree.search({
      maxX: projectedPosition.x+roid.mass/2,
      maxY: projectedPosition.y+roid.mass/2,
      minX: projectedPosition.x-roid.mass/2,
      minY: projectedPosition.y-roid.mass/2
    }).filter(a => a.position.distance(projectedPosition) < (a.mass/2+roid.mass/2))
    if (collide.length > 0) {
      const a2 = collide.shift()!
      const impactVector = a2.position.clone().subtract(projectedPosition)
      const impactNormal = impactVector.normalize()

      const v1 = roid.velocity.clone()
      // How much energy is conserved in the impact due to elasticity
      const eps = 1
      if (a2.static) {
        const impulse = impactNormal.dot(v1)
        const J = (1 + eps) * impulse
        const v1f = v1.subtract(impactNormal.clone().multiplyScalar(J))
        roid.velocity = v1f
        roid.hit = true
        // Urgh
        const chunks = splitRoid(roid, asteroidTree)
        chunks.forEach(c => {
          asteroids.push(c)
          asteroidTree.insert(c)
        })
        hits.push({owner: "asteroid", position: roid.position, target: "earth"})
        continue
      } else {
        const v1 = roid.velocity.clone()
        const v2 = a2.velocity.clone()

        const mass = roid.mass * a2.mass / (roid.mass + a2.mass)
        // Impact speed in direction of the impact normal
        const impulse = impactNormal.dot(v1.clone().subtract(v2))
        const J = (1 + eps) * mass * impulse

        //log.info(`Combined mass is ${mass}, J is ${J} Imp: ${impulse}`)
        const v1f = v1.subtract(impactNormal.clone().multiplyScalar(J/roid.mass))
        roid.velocity = v1f

        const v2f = v2.add(impactNormal.clone().multiplyScalar(J/a2.mass))
        a2.velocity = v2f
      }
    } else {
      roid.position = projectedPosition
    }
    asteroidTree.insert(roid)
  }
  return {
    asteroids: asteroids.filter(a => !a.hit),
    hits: hits
  }
}

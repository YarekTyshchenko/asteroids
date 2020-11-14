import * as express from "express";
import * as http from "http";
import RBush from "rbush";
import * as socketio from "socket.io";
import {COLLISION_DISTANCE} from "./constants";
import {log} from "./logger";
import {Asteroid, AsteroidRBush, createAsteroid, recalculateAsteroids} from "./model/asteroid";
import {HitShip, newShell, recalculateShells, Shell} from "./model/shell";
import {newShip, recalculateShips, Ship} from "./model/ship";
import Victor = require("victor");

const app = express();
const httpServer = new http.Server(app)
const io = socketio(httpServer)

export class ShipRBush extends RBush<Ship> {
  toBBox(s: Ship) { return {
    minX: s.position.x-COLLISION_DISTANCE/2,
    minY: s.position.y-COLLISION_DISTANCE/2,
    maxX: s.position.x+COLLISION_DISTANCE/2,
    maxY: s.position.y+COLLISION_DISTANCE/2
  }; }
  compareMinX(a: Ship, b: Ship) { return a.position.x - b.position.x; }
  compareMinY(a: Ship, b: Ship) { return a.position.y - b.position.y; }
}

const shipsTree = new ShipRBush()
const ships: Map<string, Ship> = new Map<string, Ship>()
let shells: Shell[] = new Array<Shell>()
let asteroids: Asteroid[] = new Array<Asteroid>()
const asteroidTree = new AsteroidRBush()

let simulationTimeStart: [number, number] = [0, 0]
let simulationTime: [number, number]
let simulationFrameGap: [number, number]

let sendTimeStart: [number, number] = [0, 0]
let sendTime: [number, number] = [0, 0]

setInterval(() => {
  if (asteroids.length < (10 * players)) {
    const roid = createAsteroid(asteroidTree)
    asteroids.push(roid)
    asteroidTree.insert(roid)
  }
}, 1000)

const calculateShipHits = (ships: Ship[], asteroidTree: AsteroidRBush): HitShip[] => {
  let hits = new Array<HitShip>()
  for (const ship of ships) {
    const collision = asteroidTree.search({
      minX: ship.position.x - COLLISION_DISTANCE/2,
      maxX: ship.position.x + COLLISION_DISTANCE/2,
      minY: ship.position.y - COLLISION_DISTANCE/2,
      maxY: ship.position.y + COLLISION_DISTANCE/2,
    }).filter(a => a.position.distance(Victor.fromObject(ship.position)) < (a.mass/2 + COLLISION_DISTANCE/2))
    if (collision.length > 0) {
      //console.log(collision)
      hits.push({owner: "asteroid", position: ship.position, target: ship.id})
    }
  }
  return hits
}

// Simulation
setInterval(() => {
  simulationFrameGap = process.hrtime(simulationTimeStart)
  simulationTimeStart = process.hrtime()
  const asteroidResults = recalculateAsteroids(asteroids, asteroidTree)
  asteroids = asteroidResults.asteroids
  recalculateShips(ships, shipsTree)
  const shipHits = calculateShipHits(Array.from(ships.values()), asteroidTree)
  const shellResult = recalculateShells(shells, shipsTree, asteroidTree)
  shells = shellResult.shells
  shellResult.hits.concat(asteroidResults.hits, shipHits).forEach(hit => {
    io.emit("shellHitShip", hit)
    // Respawn ship
    if (hit.target != "asteroid" && hit.target != "earth") {
      const ship = ships.get(hit.target)
      shipsTree.remove(ship)
      const respawn = spawn(ship.id, 450)
      ships.set(respawn.id, respawn)
      shipsTree.insert(respawn)
    }
  })
  simulationTime = process.hrtime(simulationTimeStart)
  sendTimeStart = process.hrtime()
  io.volatile.emit("update", {
    time: Date.now(),
    ships: Array.from(ships.values()),
    shells: shells,
    asteroids: asteroids,
    frameGap: hrtime(simulationFrameGap),
    simulationTime: hrtime(simulationTime),
    sendTime: hrtime(sendTime),
  })
  sendTime = process.hrtime(sendTimeStart)
}, 1000/60)

const hrtime: (a: [number, number]) => number = a => Math.round(a[0] * 1000 + (a[1] / 1000000))

const spawn = (id: string, r: number = 450) => {
  // Put a new ship somewhere where it won't collide
  do {
    const ship = newShip(id, r)
    const collide = shipsTree.collides({
      minX: ship.position.x - COLLISION_DISTANCE,
      maxX: ship.position.x + COLLISION_DISTANCE,
      minY: ship.position.y - COLLISION_DISTANCE,
      maxY: ship.position.y + COLLISION_DISTANCE,
    })
    if (!collide) {
      return ship
    } else {
      //log.info("Spawn space occupied, trying again")
      r += 10
    }
  } while (true)
}

const randomVictor = (n: number = 3000) => {
  return new Victor(Math.random()*n-n/2, Math.random()*n-n/2)
}
let players = 0
const onConnect = (id: string) => {
  log.info(`User ${id} connected`);
  if (!ships.has(id)) {
    players++
    // Put a new ship somewhere where it won't collide
    const ship = spawn(id)
    ships.set(id, ship)
    shipsTree.insert(ship)
  }
}

const onCommand = (id: string, command: string) => {
  const ship: Ship = ships.get(id)!
  switch (command) {
    case "thrust-start": ship.thrust = 0.1; break
    case "thrust-end": ship.thrust = 0; break
    case "turn-left": ship.rotation = -0.05; break
    case "turn-right": ship.rotation = 0.05; break
    case "turn-end": ship.rotation = 0; break
    case "fire": {
      shells.push(newShell(ship))
      break;
    }
  }
}

const onDisconnect = (id: string) => {
  log.info(`User ${id} disconnected`)
  players--
  const ship = ships.get(id)
  shipsTree.remove(ship)
  ships.delete(id)
  shells = shells.filter(s => s.owner != id)
}
io.on("connection", socket => {
  onConnect(socket.id)

  socket.on("command", command => {
    onCommand(socket.id, command)
  })

  socket.on("disconnect", () => {
    onDisconnect(socket.id)
  })
});

const server = httpServer.listen(3001, "0.0.0.0", () => {
  log.info("Server listening")
});

// roids
const earth = {
  static: true,
  position: new Victor(0, 0),
  velocity: new Victor(0, 0),
  mass: 100,
  hit: false
}
asteroids.push(earth)
asteroidTree.insert(earth)
// for (let r = 0; r < 2; r++) {
//   const roid = createAsteroid(asteroidTree)
//   asteroids.push(roid)
//   asteroidTree.insert(roid)
// }

// Simulate
// const commands = ["thrust-start", "thrust-end", "turn-left", "turn-right", "fire", "turn-end"]
// for (let i = 0; i < 10; i++) {
//   const id = `sim-${i}`
//   onConnect(id)
//   setInterval(() => {
//     const c = commands[Math.round(Math.random()*(commands.length-1))]
//     onCommand(id, c)
//   }, 500)
// }
// log.info("Sims loaded")

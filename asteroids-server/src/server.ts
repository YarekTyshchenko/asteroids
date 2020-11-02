import * as express from "express";
import * as http from "http";
import RBush from "rbush";
import * as socketio from "socket.io";
import {COLLISION_DISTANCE} from "./constants";
import {log} from "./logger";
import {newShell, recalculateShells, Shell} from "./model/shell";
import {newShip, recalculateShips, Ship} from "./model/ship";

const app = express();
const httpServer = new http.Server(app)
const io = socketio(httpServer)

export class ShipRBush extends RBush<Ship> {
  toBBox(s: Ship) { return { minX: s.position.x-COLLISION_DISTANCE/2, minY: s.position.y-COLLISION_DISTANCE/2, maxX: s.position.x+COLLISION_DISTANCE/2, maxY: s.position.y+COLLISION_DISTANCE/2 }; }
  compareMinX(a: Ship, b: Ship) { return a.position.x - b.position.x; }
  compareMinY(a: Ship, b: Ship) { return a.position.y - b.position.y; }
}

const shipsTree = new ShipRBush()
const ships: Map<string, Ship> = new Map<string, Ship>()
let shells: Shell[] = new Array<Shell>()

let simulationTimeStart: [number, number] = [0, 0]
let simulationTime: [number, number]
let simulationFrameGap: [number, number]

let sendTimeStart: [number, number] = [0, 0]
let sendTime: [number, number] = [0, 0]

// Simulation
setInterval(() => {
  simulationFrameGap = process.hrtime(simulationTimeStart)
  simulationTimeStart = process.hrtime()
  recalculateShips(ships, shipsTree)
  const shellResult = recalculateShells(shells, shipsTree)
  shells = shellResult.shells
  shellResult.hits.forEach(hit => {
    io.emit("shellHitShip", hit)
    // Respawn ship
    const ship = ships.get(hit.target)
    shipsTree.remove(ship)
    const respawn = spawn(ship.id, 400)
    ships.set(respawn.id, respawn)
    shipsTree.insert(respawn)
  })
  simulationTime = process.hrtime(simulationTimeStart)
  sendTimeStart = process.hrtime()
  io.volatile.emit("update", {
    time: Date.now(),
    ships: Array.from(ships.values()),
    shells: shells,
    frameGap: hrtime(simulationFrameGap),
    simulationTime: hrtime(simulationTime),
    sendTime: hrtime(sendTime),
  })
  sendTime = process.hrtime(sendTimeStart)
}, 1000/60)

const hrtime: (a: [number, number]) => number = a => Math.round(a[0] * 1000 + (a[1] / 1000000))

const spawn = (id: string, r: number = 10) => {
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

const onConnect = (id: string) => {
  log.info(`User ${id} connected`);
  if (!ships.has(id)) {
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

// Simulate
// const commands = ["thrust-start", "thrust-end", "turn-left", "turn-right", "fire", "turn-end"]
// for (let i = 0; i < 101; i++) {
//   const id = `sim-${i}`
//   onConnect(id)
//   setInterval(() => {
//     const c = commands[Math.round(Math.random()*(commands.length-1))]
//     onCommand(id, c)
//   }, 500)
// }
// log.info("Sims loaded")

import * as express from "express";
import * as http from "http";
import * as socketio from "socket.io";
import {newShell, recalculateShells, Shell} from "./model/shell";
import {newShip, recalculateShips, Ship} from "./model/ship";

const app = express();
const httpServer = new http.Server(app)
const io = socketio(httpServer)

let shells: Shell[] = new Array<Shell>()
const ships: Map<string, Ship> = new Map<string, Ship>()

let fullFrameTime: [number, number] = [0, 0]

const timer = setInterval(() => {
  const t = process.hrtime()
  recalculateShips(ships)
  shells = recalculateShells(shells)
  const frameCalculationTime = process.hrtime(t)

  io.emit("update", {
    ships: Array.from(ships.values()), //Array.from(ships.values()).slice(0, 10),// Array.from(ships.values()),
    shells: shells,
    frameCalculationTime: hrtime(frameCalculationTime),
    fullFrameTime: hrtime(fullFrameTime),
  })
  fullFrameTime = process.hrtime(t)
}, 1000/60)

const hrtime: (a: [number, number]) => number = a => Math.round(a[0] * 1000 + (a[1] / 1000000))

const onConnect = (id: string) => {
  console.log(`${id} a user connected`);
  if (!ships.has(id)) {
    // Put a new ship somewhere where it won't collide
    ships.set(id, newShip(id))
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

const server = httpServer.listen(3001, "0.0.0.0");

// Simulate
const commands = ["thrust-start", "thrust-end", "turn-left", "turn-right", "fire"]
for (let i = 0; i < 300; i++) {
  const id = `sim-${i}`
  onConnect(id)
  setInterval(() => {
    const c = commands[Math.round(Math.random()*(commands.length-1))]
    onCommand(id, c)
  }, 500)
}

import * as express from "express";
import * as http from "http";
import * as socketio from "socket.io";

const app = express();
const httpServer = new http.Server(app)
const io = socketio(httpServer)

interface Vector {
  x: number,
  y: number,
}

interface Ship {
  id: string,
  bearing: number,
  position: Vector,
  velocity: Vector,
  thrust: number,
  rotation: number,
}

interface Shell {
  owner: string,
  bearing: number,
  position: Vector,
  velocity: number,
  ttl: number,
}

const MAX_SPEED = 1

let shells: Shell[] = new Array<Shell>()
const fire: (s: Ship) => Shell = ship => {
  const shellVector = {
    x: MAX_SPEED*2 * Math.sin(ship.bearing) + ship.velocity.x,
    y: MAX_SPEED*2 * Math.cos(ship.bearing) + ship.velocity.y,
  }
  return {
    owner: ship.id,
    bearing: ship.bearing,
    position: { x: ship.position.x, y: ship.position.y },
    velocity: Math.hypot(shellVector.x, shellVector.y),
    ttl: 100,
  }
}

const ships: Map<String, Ship> = new Map<String, Ship>()

const timer = setInterval(() => {
  for(const ship of ships.values()) {
    ship.bearing = ship.bearing + ship.rotation

    const thrustVector = {x: ship.thrust * Math.sin(ship.bearing), y: ship.thrust * Math.cos(ship.bearing)}
    const finalVector = {x: thrustVector.x + ship.velocity.x, y: thrustVector.y + ship.velocity.y}
    const finalBearing = Math.atan2(finalVector.x, finalVector.y)
    let finalSpeed = Math.hypot(finalVector.x, finalVector.y)
    if (finalSpeed > MAX_SPEED) {
      finalSpeed = MAX_SPEED
    }
    ship.velocity.x = finalSpeed * Math.sin(finalBearing)
    ship.velocity.y = finalSpeed * Math.cos(finalBearing)

    ship.position.x = ship.position.x + ship.velocity.x
    ship.position.y = ship.position.y + ship.velocity.y

  }
  io.emit("ships", Array.from(ships.values()))
  for(const shell of shells.values()) {
    shell.position.x = shell.position.x + shell.velocity * Math.sin(shell.bearing)
    shell.position.y = shell.position.y + shell.velocity * Math.cos(shell.bearing)
    shell.ttl -= 1;
  }
  shells = shells.filter(s => s.ttl > 0)
  io.emit("shells", shells)
}, 1000/60)

// whenever a user connects on port 3000 via
// a websocket, log that a user has connected
io.on("connection", socket => {
  const id = socket.id
  console.log(`${id} a user connected`);
  if (!ships.has(id)) {
    ships.set(id, { id, bearing: 0, position: {x: 0, y: 0}, velocity: {x: 0, y: 0}, thrust: 0, rotation: 0 })
  }

  socket.on("command", command => {
    const ship: Ship = ships.get(id)!
    switch (command) {
      case "thrust-start": ship.thrust = 0.1; break
      case "thrust-end": ship.thrust = 0; break
      case "turn-left": ship.rotation = 0.05; break
      case "turn-right": ship.rotation = -0.05; break
      case "turn-end": ship.rotation = 0; break
      case "fire": {
        shells.push(fire(ship))
        break;
      }
    }
  })

  socket.on("disconnect", () => {
    ships.delete(socket.id)
    shells = shells.filter(s => s.owner != socket.id)
  })
});

const server = httpServer.listen(3001, function() {
  console.log("listening on *:3001");
});

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

let shells: Shell[] = new Array<Shell>()
const fire: (s: Ship) => Shell = ship => {
  return {
    owner: ship.id,
    bearing: ship.bearing,
    position: { x: ship.position.x, y: ship.position.y },
    velocity: 1 + Math.hypot(ship.velocity.x, ship.velocity.y),
    ttl: 2000,
  }
}

const ships: Map<String, Ship> = new Map<String, Ship>()
//ships.set("A", {id: "A", bearing: 0, x: 42, y: 42, thrust: 1, turn: 0.01})

const MAX_SPEED = 1

const timer = setInterval(() => {
  for(const ship of ships.values()) {
    ship.bearing = ship.bearing + ship.rotation
    // Calculate next x and y based on thrust and bearing
    // ship.position.x = ship.position.x + ship.thrust * Math.sin(ship.bearing)
    // ship.position.y = ship.position.y + ship.thrust * Math.cos(ship.bearing)
    // velocity difference
    const thrustVector = {x: 0.1 * Math.sin(ship.bearing), y: 0.1 * Math.cos(ship.bearing)}
    //const currentSpeed = Math.hypot(ship.velocity.x, ship.velocity.y)
     const targetSpeed = Math.hypot(thrustVector.x + ship.velocity.x, thrustVector.y + ship.velocity.y)
    // const delta = targetSpeed - currentSpeed
    const foo = (MAX_SPEED - targetSpeed) / 10
    const correctedThrustVector = {
      x: foo * ship.thrust * Math.sin(ship.bearing),
      y: foo * ship.thrust * Math.cos(ship.bearing)
    }
    // Limit velocity
    ship.velocity = {x: correctedThrustVector.x + ship.velocity.x, y: correctedThrustVector.y + ship.velocity.y}
    // ship.velocity.x += ship.thrust * Math.sin(ship.bearing)
    // ship.velocity.y += ship.thrust * Math.cos(ship.bearing)
    ship.position.x = ship.position.x + ship.velocity.x
    ship.position.y = ship.position.y + ship.velocity.y

  }
  //console.log(ship)
  io.emit("ships", Array.from(ships.values()))
  for(const shell of shells.values()) {
    // move shells along
    shell.position.x = shell.position.x + shell.velocity * Math.sin(shell.bearing)
    shell.position.y = shell.position.y + shell.velocity * Math.cos(shell.bearing)
    shell.ttl -= 1;
  }
  shells = shells.filter(s => s.ttl > 0)
  io.emit("shells", shells)
}, 16.6)

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
      case "thrust-start": ship.thrust = 1; break
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

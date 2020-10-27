import * as express from "express";
import * as http from "http";
import * as socketio from "socket.io";

const app = express();
const httpServer = new http.Server(app)
const io = socketio(httpServer)

interface Ship {
  id: string,
  bearing: number,
  x: number,
  y: number,
  thrust: number,
  turn: number,
}

interface Shell {
  owner: string,
  bearing: number,
  x: number,
  y: number,
  ttl: number,
}

let shells: Shell[] = new Array<Shell>()
const fire: (s: Ship) => Shell = ship => {
  return {
    owner: ship.id,
    bearing: ship.bearing,
    x: ship.x,
    y: ship.y,
    ttl: 2000,
  }
}

const ships: Map<String, Ship> = new Map<String, Ship>()
//ships.set("A", {id: "A", bearing: 0, x: 42, y: 42, thrust: 1, turn: 0.01})

const timer = setInterval(() => {
  for(const ship of ships.values()) {
    // Calculate next x and y based on thrust and bearing
    ship.x = ship.x + ship.thrust * Math.sin(ship.bearing)
    ship.y = ship.y + ship.thrust * Math.cos(ship.bearing)
    ship.bearing = ship.bearing + ship.turn
  }
  //console.log(ship)
  io.emit("ships", Array.from(ships.values()))
  for(const shell of shells.values()) {
    // move shells along
    shell.x = shell.x + 2 * Math.sin(shell.bearing)
    shell.y = shell.y + 2 * Math.cos(shell.bearing)
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
    ships.set(id, { id, bearing: 0, x: 0, y: 0, thrust: 0, turn: 0 })
  }

  socket.on("command", command => {
    const ship: Ship = ships.get(id)!
    switch (command) {
      case "thrust-start": ship.thrust = 1; break
      case "thrust-end": ship.thrust = 0; break
      case "turn-left": ship.turn = 0.05; break
      case "turn-right": ship.turn = -0.05; break
      case "turn-end": ship.turn = 0; break
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

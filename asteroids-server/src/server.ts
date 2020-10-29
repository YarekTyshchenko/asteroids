import * as express from "express";
import * as http from "http";
import * as socketio from "socket.io";
import Victor = require("victor");

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
const newShip: (id: string) => Ship = id => ({
  id,
  bearing: 0,
  position: {x: Math.random()*400-200, y: Math.random()*400-200},
  velocity: {x: 0, y: 0},
  thrust: 0,
  rotation: 0
})

interface Shell {
  owner: string,
  bearing: number,
  position: Vector,
  velocity: number,
  ttl: number,
}
const MAX_SPEED = 1

let shells: Shell[] = new Array<Shell>()
const newShell: (s: Ship) => Shell = ship => {
  const shellVector = new Victor(MAX_SPEED*2, 0).rotate(ship.bearing).add(new Victor(ship.velocity.x, ship.velocity.y))
  return {
    owner: ship.id,
    bearing: ship.bearing,
    position: { x: ship.position.x, y: ship.position.y },
    velocity: shellVector.length(),
    ttl: 100,
  }
}

const ships: Map<String, Ship> = new Map<String, Ship>()
let fullFrameTime: [number, number] = [0, 0]

const COLLISION_DISTANCE = 20

const timer = setInterval(() => {
  const t = process.hrtime()
  for(const ship of ships.values()) {
    ship.bearing = ship.bearing + ship.rotation
    const shipVelocity = new Victor(ship.velocity.x, ship.velocity.y)

    const thrustVector = new Victor(ship.thrust, 0).rotate(ship.bearing)
    const finalVector = shipVelocity.add(thrustVector)
    const finalBearing = finalVector.angle()
    let finalSpeed = finalVector.length()
    if (finalSpeed > MAX_SPEED) {
      //finalSpeed = MAX_SPEED
    }
    const velocity = new Victor(finalSpeed, 0).rotate(finalBearing)
    ship.velocity.x = velocity.x
    ship.velocity.y = velocity.y

    // check for collision
    const v1 = new Victor(ship.position.x + ship.velocity.x, ship.position.y + ship.velocity.y)
    const collide = Array.from(ships.values()).filter(s =>
      ship.id != s.id && v1.distance(new Victor(s.position.x, s.position.y)) < COLLISION_DISTANCE
    )
    if (collide.length > 0) {
      const otherShip = ships.get(collide[0].id)!
      const r1 = new Victor(ship.position.x, ship.position.y)
      const r2 = new Victor(otherShip.position.x, otherShip.position.y)
      const impactVector = r2.subtract(r1).invert()
      const impactNormal = impactVector.divideScalar(impactVector.length())
      console.log(`Collision between ${ship.id} and ${otherShip.id}: ${impactVector}, ${impactNormal}`);

      const v1 = new Victor(ship.velocity.x, ship.velocity.y)
      const v2 = new Victor(otherShip.velocity.x, otherShip.velocity.y)

      const impactSpeed = impactNormal.dot(v1.subtract(v2))
      const impulse = impactSpeed
      console.log(`Initial speed ${v1}`)
      console.log(`impact speed: ${impactSpeed}, ${impulse}`)

      const v1f = v1.subtractScalar(impulse)
      //const v2f = impactNormal.invert().multiply(v2.addScalar(impulse))
      ship.velocity.x = v1f.x
      ship.velocity.y = v1f.y
      ship.position.x = ship.position.x + ship.velocity.x
      ship.position.y = ship.position.y + ship.velocity.y


      // otherShip.velocity.x = v2f.x
      // otherShip.velocity.y = v2f.y
      // otherShip.position.x = otherShip.position.x + otherShip.velocity.x
      // otherShip.position.y = otherShip.position.y + otherShip.velocity.y
      console.log(`Post collision distance: ${(new Victor(ship.position.x, ship.position.y)).distance(new Victor(otherShip.position.x, otherShip.position.y))}`);
    }
    ship.position.x = ship.position.x + ship.velocity.x
    ship.position.y = ship.position.y + ship.velocity.y

  }
  for(const shell of shells.values()) {
    const shellPosition = new Victor(shell.velocity, 0).rotate(shell.bearing).add(new Victor(shell.position.x, shell.position.y))
    shell.position.x = shellPosition.x
    shell.position.y = shellPosition.y
    shell.ttl -= 1;
  }
  shells = shells.filter(s => s.ttl > 0)
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
for (let i = 0; i < 3; i++) {
  const id = `sim-${i}`
  onConnect(id)
  setInterval(() => {
    const c = commands[Math.round(Math.random()*(commands.length-1))]
    //onCommand(id, c)
  }, 500)
}

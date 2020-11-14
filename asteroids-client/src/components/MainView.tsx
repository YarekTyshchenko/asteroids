import * as React from "react";
import Victor from "victor";
import {Asteroid} from "../providers/WorldContext";
import {Hit, Shell, Ship, World} from "../service/World";
import {useAnimationFrame} from "../util";
import {CanvasState} from "./Canvas";

export interface Point {
  x: number
  y: number
}

const calculateCentreFromPlayer = (playerId: string, ships: Ship[], width: number, height: number) => {
  const ship = ships.find(s => s.id === playerId)
  if (!ship) {
    return {x: 0, y: 0}
  } else {
    return {x: Math.round(ship.position.x / width) * width, y: Math.round(ship.position.y / height) * height}
  }
}

const MainView: React.FC<{canvas: CanvasState, world: World, socket: SocketIOClient.Socket}> = ({canvas, world, socket}) => {
  useAnimationFrame(delta => {
    const timeMs = Date.now()
    const ships = world.ships(timeMs)
    const shells = world.shells()
    const hits = world.hits()
    const asteroids = world.asteroids()
    const centre = calculateCentreFromPlayer(socket.id, ships, canvas.width, canvas.height)
    const drawer = canvasDrawer(canvas.ctx, centre)
    drawer.text(world.debug(), 10, 10, "gray")
    // drawer.text(`Delta: ${delta}`, 10, 20, "gray")
    hits.forEach(hit => {
      drawer.hit(hit)
    })
    shells.forEach(s => {
      drawer.shell(s)
    })
    ships.forEach(s => {
      drawer.ship(s)
    })
    asteroids.forEach(a => {
      drawer.asteroid(a)
    })
  })
  return null
}

const canvasDrawer = (ctx: CanvasRenderingContext2D, centre: Point) => {
  const width = ctx.canvas.clientWidth
  const height = ctx.canvas.clientHeight
  const local = (p: Point): Point => {
    return ({
      x: p.x - centre.x + width/2,
      y: p.y - centre.y + height/2
    })
  }
  ctx.font = '8pt Mono'
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "black"
  ctx.fillRect(0, 0, width, height);

  const drawVerticalLine = (x: number) => {
    ctx.moveTo(x+.5, 0)
    ctx.lineTo(x+.5, height)
  }
  const drawHorizontalLine = (y: number) => {
    ctx.moveTo(0, y+.5)
    ctx.lineTo(width, y+.5)
  }

  const shipBodyParts = [
    new Victor(10, 0),
    new Victor(-5, -5),
    new Victor(-5, 5)
  ]
  const thrustConeParts = [
    new Victor(-5, -2),
    new Victor(-10, 0),
    new Victor(-5, 2),
  ]

  return {
    asteroid: (a: Asteroid) => {
      const l = local(a.position)
      ctx.beginPath()
      ctx.arc(l.x, l.y, a.mass/2, 0, 2 * Math.PI, false)
      ctx.stroke()
    },
    ship: (s: Ship) => {
      ctx.fillStyle = "white"
      const l = local(s.position)
      const localVector = new Victor(l.x, l.y)

      // Ship
      ctx.lineWidth = 1
      ctx.strokeStyle = "white"
      ctx.fillStyle = "black"

      const [nose, left, right] = shipBodyParts.map(v => v.clone().rotate(s.bearing).add(new Victor(l.x, l.y)))
      ctx.beginPath()
      // nose
      ctx.moveTo(nose.x, nose.y)
      // left
      ctx.lineTo(left.x, left.y)
      // right
      ctx.lineTo(right.x, right.y)
      ctx.lineTo(nose.x, nose.y)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // thrust cone
      if (s.thrust > 0) {
        const [left, tip, right] = thrustConeParts.map(v => v.clone().rotate(s.bearing).add(localVector))
        ctx.beginPath()
        ctx.moveTo(left.x, left.y)
        ctx.lineTo(tip.x, tip.y)
        ctx.lineTo(right.x, right.y)
        ctx.stroke()
      }
    },
    shell: (s: Shell) => {
      ctx.lineWidth = 1
      ctx.strokeStyle = "white"
      ctx.beginPath()
      const l = local(s.position)
      const shellTip = new Victor(5, 0).rotate(s.bearing).add(new Victor(l.x, l.y))
      ctx.moveTo(l.x, l.y)
      ctx.lineTo(shellTip.x, shellTip.y)
      ctx.stroke()
    },
    hit: (hit: Hit) => {
      ctx.lineWidth = 1
      const d = Math.round((1-hit.phase)*255).toString(16).padStart(2, "0")
      ctx.strokeStyle = `#${d}${d}${d}`
      const l = local(hit.position)
      ctx.beginPath()
      ctx.arc(l.x, l.y, hit.phase*20, 0, 2 * Math.PI, false)
      ctx.stroke()
    },
    centreGraduation: () => {
      ctx.strokeStyle = "#333333"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, Math.floor(height/2)+0.5)
      ctx.lineTo(width, Math.floor(height/2)+0.5)
      ctx.moveTo(Math.floor(width/2)+0.5, 0)
      ctx.lineTo(Math.floor(width/2)+0.5, height)
      ctx.stroke()
    },
    text: (text: string, x: number, y: number, colour: string = "white") => {
      ctx.fillStyle = colour
      ctx.fillText(text, x, y)
    },
    grid: (tileSize: number = 100) => {
      ctx.strokeStyle = "#555555"
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let i = 0; i < width + tileSize; i+= tileSize) {
        let x = Math.floor(i + (width/2 - centre.x) % tileSize)
        drawVerticalLine(x)
      }
      for (let i = 0; i < height + tileSize; i+= tileSize) {
        let y = Math.floor(i + (height/2 - centre.y) % tileSize)
        drawHorizontalLine(y)
      }
      ctx.stroke()

      ctx.fillStyle = "white"
      for (let i = 0; i < width + tileSize; i+= 100) {
        let x = i + (width/2 - centre.x) % tileSize
        ctx.fillText((
          Math.ceil((centre.x - width/2 + i) /tileSize)*tileSize
        ).toFixed(0).toString(), x, 100)
      }
      for (let i = 0; i < height + tileSize; i+= 100) {
        let y = i + (height/2 - centre.y) % tileSize
        ctx.fillText((
          Math.ceil((centre.y - height/2 + i) /tileSize)*tileSize
        ).toFixed(0).toString(), 5, y)
      }
    }
  }
}

export { MainView, useAnimationFrame, canvasDrawer }

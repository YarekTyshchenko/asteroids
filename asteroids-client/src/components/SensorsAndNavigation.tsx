import * as React from "react";
import Victor from "victor";
import {Shell, Ship, World} from "../service/World";
import {resizeCanvasToDisplaySize, useAnimationFrame} from "../util";

export interface Point {
  x: number
  y: number
}

const SensorsAndNavigation: React.FC<{world: World, zoom: number}> = ({world, zoom}) => {
  const canvasRef = React.createRef<HTMLCanvasElement>();

  useAnimationFrame(delta => {
    const timeMs = Date.now()
    const ships = world.ships(timeMs);
    const shells = world.shells()
    const canvas = canvasRef.current
    if (canvas) {
      resizeCanvasToDisplaySize(canvas)
      const ctx = canvas.getContext('2d')!
      const drawer = canvasDrawer(ctx, {x: 0, y: 0}, zoom)
      drawer.centreGraduation()
      drawer.grid()
      drawer.text(`Delta: ${delta}`, 10, 10)
      drawer.text(world.debug(), 10, 20)
      ships.forEach(s => {
        drawer.ship(s)
      })
      shells.forEach(s => {
        drawer.shell(s)
      })
    }
  })
  return (
    <>
      <canvas ref={canvasRef} />
      <div className="absolute">

      </div>
    </>
  )
}

const canvasDrawer = (ctx: CanvasRenderingContext2D, centre: Point, zoom: number) => {
  const width = ctx.canvas.clientWidth
  const height = ctx.canvas.clientHeight
  const local = (p: Point): Point => {
    return ({
      x: p.x / zoom - centre.x / zoom + width/2,
      y: p.y / zoom - centre.y / zoom + height/2
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

  const drawLine = (x1: number, y1: number, x2: number, y2: number, colour: string) => {
    ctx.beginPath()
    ctx.strokeStyle = colour
    ctx.lineWidth = 1
    const f = local({x: x1, y: y1})
    ctx.moveTo(f.x, f.y)
    const t = local({x: x2, y: y2})
    ctx.lineTo(t.x, t.y)
    ctx.stroke();
  }

  return {
    ship: (s: Ship) => {
      ctx.fillStyle = "white"
      const l = local(s.position)
      //ctx.fillText(s.id, l.x, l.y)
      ctx.lineWidth = 1
      ctx.strokeStyle = "white"

      const shipVectorArray = [
        new Victor(10, 0),
        new Victor(-5, -5),
        new Victor(-5, 5)
      ]

      shipVectorArray.map(v => v.rotate(s.bearing).add(new Victor(l.x, l.y)))
      const [nose, left, right] = shipVectorArray
      ctx.beginPath()
      // nose
      ctx.moveTo(nose.x, nose.y)
      // left
      ctx.lineTo(left.x, left.y)
      // right
      ctx.lineTo(right.x, right.y)
      ctx.lineTo(nose.x, nose.y)
      ctx.stroke()

      // ctx.beginPath()
      // ctx.arc(l.x, l.y, 7, 0, 2 * Math.PI, false)
      // ctx.stroke()
    },
    shell: (s: Shell) => {
      ctx.lineWidth = 1
      ctx.strokeStyle = "red"
      ctx.beginPath()
      const l = local(s.position)
      const shellTip = new Victor(5, 0).rotate(s.bearing).add(new Victor(l.x, l.y))
      ctx.moveTo(l.x, l.y)
      ctx.lineTo(shellTip.x, shellTip.y)
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
    text: (text: string, x: number, y: number) => {
      ctx.fillStyle = "white"
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

export { SensorsAndNavigation, useAnimationFrame, canvasDrawer }

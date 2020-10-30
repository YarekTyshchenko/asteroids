export interface Vector {
  x: number,
  y: number,
}

export interface Ship {
  id: string,
  bearing: number,
  position: Vector,
  velocity: Vector,
  thrust: number,
  turn: number,
}

export interface Shell {
  owner: string,
  bearing: number,
  position: Vector,
  ttl: number,
}

export interface World {
  ships: (timeMs: number) => Ship[],
  shells: () => Shell[],
  update: (ships: Ship[], shells: Shell[], st: number, ft: number, d: number) => void,
  debug: () => string,
}

/**
 * Client side simulation of the entire game world.
 * Must include state machine for movement based on game time.
 */
const createWorld: () => World = () => {
  let ships = new Array<Ship>()
  let shells = new Array<Shell>()
  let frameTimeArray = new Array<number>()
  let debug = "Debug"

  return {
    debug: () => debug,
    ships: (t) => ships,
    shells: () => shells,
    update: (ships2: Ship[], shells2: Shell[], st: number, ft: number, d: number) => {
      ships = ships2
      shells = shells2
      frameTimeArray.unshift(ft)
      if (frameTimeArray.length > 60) {
        frameTimeArray.pop()
      }
      const tft = frameTimeArray.reduce((accu, i) => accu + i, 0)/60
      debug = `Simulation time: ${String(st).padStart(3)}ms, Full frame time: ${String(ft).padStart(3)}ms (${String(Math.round(tft/16.6*100)).padStart(3)}%), delay ${Math.round(d/16.6*100)}`
    },
  }
}

export { createWorld }

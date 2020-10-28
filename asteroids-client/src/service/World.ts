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
  updateShip: (s: Ship) => void,
  updateShells: (shells: Shell[]) => void,
  debug: () => string,
}

/**
 * Client side simulation of the entire game world.
 * Must include state machine for movement based on game time.
 */
const createWorld: () => World = () => {
  const ships = new Map<string, Ship>()
  let shells = new Array<Shell>()
  let debug = "Debug"

  return {
    debug: () => debug,
    ships: (t) => Array.from(ships.values()),
    shells: () => shells,
    updateShip: (s: Ship) => {
      ships.set(s.id, s);
    },
    updateShells: s => {
      shells = s
    },
  }
}

export { createWorld }

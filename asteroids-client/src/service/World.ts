import {HitShip, UpdateData} from "../providers/WorldContext";

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

export interface Hit {
  position: Vector
  phase: number
}

export interface World {
  ships: (timeMs: number) => Ship[]
  shells: () => Shell[]
  hits: () => Hit[]
  update: (data: UpdateData) => void
  addHit: (hit: HitShip) => void
  incrementScore: () => void
  decrementScore: () => void
  score: () => number
  debug: () => string
}

/**
 * Client side simulation of the entire game world.
 * Must include state machine for movement based on game time.
 */
const createWorld: () => World = () => {
  // Server side data
  let ships = new Array<Ship>()
  let shells = new Array<Shell>()
  // Client side data
  let hits = new Array<Hit>()
  let score = 0

  // Debug
  let simTimeArray = new Array<number>()
  let sendTimeArray = new Array<number>()
  let debug = "Debug"

  const rp = (n: number) => String(Math.round(n)).padStart(3)

  return {
    debug: () => debug,
    hits: () => {
      hits.forEach(hit => hit.phase += 1/60)
      hits = hits.filter(h => h.phase < 1)
      return hits
    },
    addHit: (hit: HitShip) => {
      hits.push({position: hit.position, phase: 0})
    },
    incrementScore: () => score++,
    decrementScore: () => score--,
    score: () => score,
    ships: (t) => ships,
    shells: () => shells,
    update: (data: UpdateData) => {
      ships = data.ships
      shells = data.shells

      const timeDelta = Date.now() - data.time

      simTimeArray.unshift(data.simulationTime)
      if (simTimeArray.length > 60) {
        simTimeArray.pop()
      }
      const simTime = simTimeArray.reduce((accu, i) => accu + i, 0)/60

      sendTimeArray.unshift(data.sendTime)
      if (sendTimeArray.length > 60) sendTimeArray.pop()
      const sendTime = sendTimeArray.reduce((a, i) => a + i, 0)/60
      debug = `Delay: ${rp(timeDelta)}ms Simulation time: ${rp(data.simulationTime)}ms (${rp(simTime)}ms) ${rp(simTime/16.6*100)}%, sendTime: ${rp(data.sendTime)}ms (${rp(sendTime)}ms) ${rp(sendTime/16.6*100)}%, Inter-frame delay: ${rp(data.frameGap)}ms`
    },
  }
}

export { createWorld }

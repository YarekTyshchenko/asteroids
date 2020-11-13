import * as React from 'react';
import {createWorld, Shell, Ship, Vector, World} from "../service/World";
import {SocketConsumer} from "./SocketContext";

const world = createWorld()
const WorldContext = React.createContext<World>(world)

export interface UpdateData {
  ships: Ship[],
  shells: Shell[],
  simulationTime: number,
  sendTime: number,
  frameGap: number,
  time: number,
}

export interface HitShip {
  owner: string
  position: Vector
  target: string
}

const WorldProvider: React.FC = ({children}) => {
  return (
    <WorldContext.Provider value={world}>
      <SocketConsumer>
        { socket => {
          socket.on("update", (data: UpdateData) => {
            world.update(data)
            if (!world.playerShip.isStopped) {
              const playerShip = data.ships.find(s => s.id === socket.id)
              if (playerShip) {
                world.playerShip.next(playerShip)
                //world.playerShip.complete()
              }
            }
          })
          socket.on("shellHitShip", (data: HitShip) => {
            world.addHit(data)
            if (data.target === socket.id) {
              world.decrementScore()
            } else if (data.owner === socket.id) {
              world.incrementScore()
            }
          })
          return (<>{children}</>)
        }}
      </SocketConsumer>
    </WorldContext.Provider>
  )
}

const WorldConsumer = WorldContext.Consumer

export { WorldProvider, WorldConsumer }

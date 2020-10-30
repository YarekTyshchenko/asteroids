import * as React from 'react';
import {createWorld, Shell, Ship, World} from "../service/World";
import {SocketConsumer} from "./SocketContext";

const world = createWorld()
const WorldContext = React.createContext<World>(world)

export interface UpdateData {
  ships: Ship[],
  shells: Shell[],
  simulationTime: number,
  simulationFrameGap: number,
  sendTime: number,
  sendTimeFrameGap: number,
  time: number,
}

const WorldProvider: React.FC = ({children}) => {
  return (
    <WorldContext.Provider value={world}>
      <SocketConsumer>
        { socket => {
          socket.on("update", (data: UpdateData) => {
            world.update(data)
          })
          return (<>{children}</>)
        }}
      </SocketConsumer>
    </WorldContext.Provider>
  )
}

const WorldConsumer = WorldContext.Consumer

export { WorldProvider, WorldConsumer }

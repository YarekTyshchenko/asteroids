import * as React from 'react';
import {createWorld, Shell, Ship, World} from "../service/World";
import {SocketConsumer} from "./SocketContext";

const world = createWorld()
const WorldContext = React.createContext<World>(world)

const WorldProvider: React.FC = ({children}) => {
  return (
    <WorldContext.Provider value={world}>
      <SocketConsumer>
        { socket => {
          socket.on("ships", (ships: any) => {
            const s = (ships as Ship[])
            s.forEach(world.updateShip)
          })
          socket.on("shells", (shells: any) => {
            const s = (shells as Shell[])
            world.updateShells(s)
          })
          return (<>{children}</>)
        }}
      </SocketConsumer>
    </WorldContext.Provider>
  )
}

const WorldConsumer = WorldContext.Consumer

export { WorldProvider, WorldConsumer }

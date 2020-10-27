import * as React from 'react';
import * as io from "socket.io-client"

const connection = io.connect("http://localhost:3001")
const SocketContext = React.createContext<SocketIOClient.Socket>(connection)

const SocketProvider: React.FC = ({children}) => {
  return (
    <SocketContext.Provider value={connection}>
      {children}
    </SocketContext.Provider>
  )
}
const SocketConsumer = SocketContext.Consumer

export { SocketProvider, SocketConsumer }

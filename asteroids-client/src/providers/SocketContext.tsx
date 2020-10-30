import * as React from 'react';
import * as io from "socket.io-client"

const connection = io.connect(`https://asteroids-3ukqg.ondigitalocean.app/`)
const SocketContext = React.createContext<SocketIOClient.Socket>(connection)
const SocketConsumer = SocketContext.Consumer

export { SocketConsumer }

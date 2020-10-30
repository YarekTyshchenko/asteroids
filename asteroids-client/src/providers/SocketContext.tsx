import * as React from 'react';
import * as io from "socket.io-client"

const connection = io.connect(`http://${window.location.hostname}:3001`)
const SocketContext = React.createContext<SocketIOClient.Socket>(connection)
const SocketConsumer = SocketContext.Consumer

export { SocketConsumer }

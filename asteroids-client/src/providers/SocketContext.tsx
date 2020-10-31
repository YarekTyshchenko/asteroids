import * as React from 'react';
import * as io from "socket.io-client"

const connection = io.connect(process.env.REACT_APP_SOCKET || "https://asteroids.yarekt.co.uk")
const SocketContext = React.createContext<SocketIOClient.Socket>(connection)
const SocketConsumer = SocketContext.Consumer

export { SocketConsumer }

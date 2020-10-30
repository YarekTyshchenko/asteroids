import * as React from 'react';
import * as io from "socket.io-client"

const connection = io.connect("https://asteroids.yarekt.co.uk")
const SocketContext = React.createContext<SocketIOClient.Socket>(connection)
const SocketConsumer = SocketContext.Consumer

export { SocketConsumer }

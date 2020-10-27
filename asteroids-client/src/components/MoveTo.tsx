import * as React from "react";
import {useKeyPress} from "../util";

const MoveTo: React.FC<{socket: SocketIOClient.Socket}> = ({socket}) => {
  const up = useKeyPress('ArrowUp')
  const left = useKeyPress('ArrowLeft')
  const right = useKeyPress('ArrowRight')
  const space = useKeyPress(" ")

  React.useEffect(() => {
    if (up) {
      socket.emit("command", "thrust-start")
    } else {
      socket.emit("command", "thrust-end")
    }
  }, [socket, up])
  React.useEffect(() => {
    if (left) {
      socket.emit("command", "turn-left")
    } else {
      socket.emit("command", "turn-end")
    }
  }, [socket, left])
  React.useEffect(() => {
    if (right) {
      socket.emit("command", "turn-right")
    } else {
      socket.emit("command", "turn-end")
    }
  }, [socket, right])
  React.useEffect(() => {
    if (space) {
      socket.emit("command", "fire")
    }
  }, [socket, space])

  return (<></>)
};

export { MoveTo }

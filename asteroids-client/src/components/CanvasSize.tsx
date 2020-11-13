import * as React from 'react';
import {CanvasState} from "./Canvas";

interface Bounds {
  width: number
  height: number
}

const CanvasSize: React.FC<{canvas: CanvasState, children: (a: Bounds) => React.ReactElement}> = ({canvas, children}) => {
  const [bounds, setBounds] = React.useState<Bounds>({width: canvas.width, height: canvas.height})
  React.useEffect(() => {
    setBounds({width: canvas.width, height: canvas.height})
  }, [canvas.width, canvas.height])

  return children(bounds)
}

export {CanvasSize}

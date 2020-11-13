import * as React from "react";
import {resizeCanvasToDisplaySize, useAnimationFrame} from "../util";
import {RefUnwrap} from "./RefUnwrap";

type ChildrenFn = (canvas: CanvasState) => React.ReactElement

interface Props {
  children: ChildrenFn
}

const Canvas: React.FC<Props> = ({children}) => {
  const canvasRef = React.createRef<HTMLCanvasElement>();
  return (
    <>
      <canvas ref={canvasRef} />
      <RefUnwrap refObject={canvasRef}>
        {current =>
          <Wrapper canvas={current} childrenFn={children} />
        }
      </RefUnwrap>
    </>
  )
}

export interface CanvasState {
  ctx: CanvasRenderingContext2D
  height: number
  width: number
}

const Wrapper: React.FC<{canvas: HTMLCanvasElement, childrenFn: ChildrenFn}> = ({canvas, childrenFn}) => {
  const ctx = canvas.getContext('2d')!
  const [state, setState] = React.useState<CanvasState>({
    ctx, height: canvas.height, width: canvas.width
  })
  useAnimationFrame(delta => {
    resizeCanvasToDisplaySize(canvas)
    setState({ctx, height: canvas.height, width: canvas.width})
  })

  return childrenFn(state)
}

export {Canvas}

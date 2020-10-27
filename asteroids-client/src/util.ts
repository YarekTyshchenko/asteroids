import * as React from "react";

/**
 * Resize a canvas to match the size its displayed.
 * @param {HTMLCanvasElement} canvas The canvas to resize.
 * @param {number} [multiplier] amount to multiply by.
 *    Pass in window.devicePixelRatio for native pixels.
 * @return {boolean} true if the canvas was resized.
 * @memberOf module:webgl-utils
 */
export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement, multiplier: number = 1) {
  const width  = canvas.clientWidth  * multiplier | 0;
  const height = canvas.clientHeight * multiplier | 0;
  if (canvas.width !== width ||  canvas.height !== height) {
    canvas.width  = width;
    canvas.height = height;
    console.log(`W: ${canvas.clientHeight} H: ${canvas.clientWidth}`)
    return true;
  }
  return false;
}

export const useAnimationFrame = (callback: (a: number) => void) => {
  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = React.useRef<number>();
  const previousTimeRef = React.useRef<number>();

  React.useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callback(deltaTime)
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    }
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      requestRef.current && cancelAnimationFrame(requestRef.current)
    };
  }, [requestRef, previousTimeRef, callback]); // Make sure the effect runs only once
}

//10, 20, 30
export const midpointFraction = (from: number, t: number, to: number): number => {
  const upper = to - from
  const mid = t - from
  return mid / upper;
}

export const correctByFraction = (from: number, to: number, fraction: number): number => {
  return ((to - from) * fraction) + from
}

// Hook
export function useKeyPress(targetKey: string) {
  // State for keeping track of whether key is pressed
  const [keyPressed, setKeyPressed] = React.useState(false);

  // Add event listeners
  React.useEffect(() => {
    // If pressed key is our target key then set to true
    function downHandler(ev: KeyboardEvent) {
      if (ev.key === targetKey) {
        setKeyPressed(true);
      }
    }

    // If released key is our target key then set to false
    const upHandler = (ev: KeyboardEvent) => {
      if (ev.key === targetKey) {
        setKeyPressed(false);
      }
    };
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [targetKey]);

  return keyPressed;
}

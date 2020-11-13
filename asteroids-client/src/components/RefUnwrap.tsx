import * as React from "react";

interface RefProps<T> {
  refObject: React.RefObject<T>
  children: (t: T) => React.ReactElement
}

/**
 * Renders children only when ref is set. Re-renders once.
 */
const RefUnwrap = <T extends object>(props: RefProps<T>) => {
  const [current, setCurrent] = React.useState(props.refObject.current)
  React.useLayoutEffect(() => {
    if (props.refObject.current) {
      setCurrent(props.refObject.current)
    }
  }, [props.refObject])
  if (current) {
    return props.children(current)
  } else {
    return null
  }
}

export {RefUnwrap}

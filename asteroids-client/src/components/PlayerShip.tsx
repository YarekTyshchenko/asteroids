import * as React from "react";
import {Mutable} from "../model/Mutable";
import {Ship, World} from "../service/World";

interface PlayerShipProps {
  children: (ship: Ship) => React.ReactElement
  world: Mutable<World>
}

const PlayerShip: React.FC<PlayerShipProps> = ({children, world}) => {
  const [ship, setShip] = React.useState<Ship | undefined>()

  React.useEffect(() => {
    const subscription = world.playerShip.subscribe(pship => {
      setShip(pship)
    })
    return () => subscription.unsubscribe()
  })
  if (ship) {
    return children(ship)
  } else {
    return <p>Waiting for player ship</p>
  }
}

export {PlayerShip}

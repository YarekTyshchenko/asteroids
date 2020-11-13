import * as React from "react";
import {World} from "../service/World";

const Score: React.FC<{world: World}> = ({world}) => {
  const [score, setScore] = React.useState<number>(world.score.currentScore())
  React.useEffect(() => {
    world.score.score.subscribe(_ => {
      setScore(world.score.currentScore())
    })
  })
  return (
    <div className="absolute score">
      Score: {score}
    </div>
  )
}

export {Score}

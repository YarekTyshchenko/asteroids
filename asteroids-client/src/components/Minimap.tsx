import * as React from "react";
import {Ship} from "../service/World";

const Minimap: React.FC<{width: number, height: number, playerShip: Ship}> = ({width, height, playerShip}) => {
  const getColumnName = (k: number) => {
    const toLetters = (i: number) => {
      const previousLetters: string = (i >= 26 ? toLetters(Math.floor(i / 26) -1) : '');
      const lastLetter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i % 26];
      return previousLetters + lastLetter;
    }
    return (k < 0 ? '-' : '') + toLetters(Math.abs(k))
  }

  return (<div className="absolute sector">
    Sector {getColumnName(Math.round(playerShip.position.x / width))}{Math.round(playerShip.position.y / height)}
  </div>)
}

export {Minimap}


import * as React from 'react';

const id = (new URL(window.location.href)).searchParams.get("id")!
const PlayerContext = React.createContext<string>(id)

const PlayerIdConsumer = PlayerContext.Consumer
const PlayerIdProvider: React.FC = ({children}) =>
  <PlayerContext.Provider value={id}>
    {children}
  </PlayerContext.Provider>

export { PlayerIdConsumer, PlayerIdProvider }

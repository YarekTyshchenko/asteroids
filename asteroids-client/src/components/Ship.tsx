import * as React from 'react';
import {SSEConsumer} from "./SSE";

const ShipContext = React.createContext<Ship | undefined>(undefined);

interface Ship {
  location: string;
}

const ShipProvider: React.FunctionComponent = ({ children }) => {
  const [location, setLocation] = React.useState<string>("");
  return (
    <SSEConsumer>
      {sse => {
        console.log("Adding listener", sse);
        sse && sse.addEventListener("ship", function (e) {
          setLocation((e as any).data)
        });

        return (
          <ShipContext.Provider value={{location: location}}>
            {children}
          </ShipContext.Provider>
        );
      }}
    </SSEConsumer>
  )
};

const ShipConsumer = ShipContext.Consumer;

export {ShipProvider, ShipConsumer};

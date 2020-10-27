import * as React from "react";

const SSEContext = React.createContext<EventSource | undefined>(undefined);

export const SSEProvider: React.FunctionComponent = ({ children }) => {
  return (
    <SSEContext.Provider
      value={new EventSource("http://localhost:1337/events")}
    >
      {children}
    </SSEContext.Provider>
  );
};

export const SSEConsumer = SSEContext.Consumer;

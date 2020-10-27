import * as React from 'react';
import './App.css';
import {MoveTo} from "./components/MoveTo";
import {SensorsAndNavigation} from "./components/SensorsAndNavigation";
import {SocketConsumer} from "./providers/SocketContext";
import {WorldConsumer} from "./providers/WorldContext";

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <WorldConsumer>
          { world =>
            <>
              <SensorsAndNavigation world={world} zoom={1}/>
              <SocketConsumer>
                {socket => <MoveTo socket={socket}/>}
              </SocketConsumer>

            </>
          }
        </WorldConsumer>
      </header>
    </div>
  );
};

export default App;

import * as React from 'react';
import './App.css';
import {Canvas} from "./components/Canvas";
import {CanvasSize} from "./components/CanvasSize";
import {Minimap} from "./components/Minimap";
import {MoveTo} from "./components/MoveTo";
import {PlayerShip} from "./components/PlayerShip";
import {Score} from "./components/Score";
import {MainView} from "./components/MainView";
import {SocketConsumer} from "./providers/SocketContext";
import {WorldConsumer} from "./providers/WorldContext";

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <WorldConsumer>
          { world =>
            <SocketConsumer>
              {socket =>
                <>
                  <Canvas>
                    {canvas =>
                      <>
                        <MainView canvas={canvas} socket={socket} world={world} />
                        <CanvasSize canvas={canvas}>
                          {({width, height}) =>
                            <PlayerShip world={world}>
                              { playerShip =>
                                <Minimap width={width} height={height} playerShip={playerShip} />
                              }
                            </PlayerShip>
                          }
                        </CanvasSize>
                      </>
                    }
                  </Canvas>
                  <MoveTo socket={socket}/>
                  <Score world={world} />
                </>
              }
            </SocketConsumer>
          }
        </WorldConsumer>
      </header>
    </div>
  );
};

export default App;

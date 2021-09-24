import { Button, CircularProgress, TextField } from "@material-ui/core";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import React, { Suspense, useRef, useState, useEffect } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const Model = () => {
  const gltf = useLoader(GLTFLoader, "./scene.glb");
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (mesh !== undefined) {
      mesh.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={mesh} position={[0, -1, 0]} scale={0.6}>
      <primitive object={gltf.scene} />
    </mesh>
  );
};

function App() {
  const [audio] = useState(new Audio("/Off The Grid.mp3"));
  const [audioPlaying, setAudioPlaying] = useState(true);
  const [symbol, setSymbol] = useState("TSLA");
  const [loading, setLoading] = useState(false);
  const [buyOrSell, setBuyOrSell] = useState<String | null>(null);
  const [MacDIndicator, setMacDIndicator] = useState<Number | null>(null);

  useEffect(() => {
    if (audioPlaying) {
      audio.play();
      audio.loop = true;
      audio.volume = 0.3;
    } else {
      audio.pause();
    }
  }, [audio, audioPlaying]);

  const handleMusicClick = () => {
    setAudioPlaying(!audioPlaying);
  };

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      const apiKey = process.env.REACT_APP_API_KEY;
      const res = await fetch(
        `https://www.alphavantage.co/query?function=MACD&symbol=${symbol}&interval=daily&time_period=5&series_type=close&apikey=${apiKey}&datatype=json`
      );
      const data = await res.json();
      const recent = Object.keys(data["Technical Analysis: MACD"])[0];
      const signal = data["Technical Analysis: MACD"][recent]["MACD_Signal"];

      setMacDIndicator(signal);
      if (signal < 0.3) {
        setBuyOrSell("SELL");
      } else {
        setBuyOrSell("BUY");
      }
    } catch (e) {
      alert("STOCK SYMBOL NOT FOUND OR COULD NOT BE PREDICTED! TRY ANOTHER!");
    } finally {
      setLoading(false);
    }
  };

  const renderBuyOrSell = () => {
    if (buyOrSell) {
      if (buyOrSell === "BUY") {
        return (
          <>
            <h3 style={{ color: "green" }}>BUY/HOLD</h3>
            <h5 style={{ color: "green", marginTop: "0" }}>
              MACD: {MacDIndicator}
            </h5>
          </>
        );
      } else {
        return (
          <>
            <h3 style={{ color: "red" }}>SELL</h3>
            <h5 style={{ color: "red", marginTop: "0" }}>
              MACD: {MacDIndicator}
            </h5>
          </>
        );
      }
    } else {
      return null;
    }
  };

  return (
    <div
      className="App"
      style={{
        minHeight: "1000px",
        height: "100vh",
        backgroundColor: "#141414",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: "white",
        textAlign: "center",
        padding: "0px 12px",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginTop: "1rem",
        }}
      >
        <span style={{ marginRight: "1rem" }}>
          Song: Off the Grid - Kanye West
        </span>
        <Button onClick={handleMusicClick} variant="contained">
          TURN {audioPlaying ? "OFF" : "ON"} MUSIC
        </Button>
      </div>
      <div style={{ minHeight: "500px", background: "transparent" }}>
        <Canvas style={{ minHeight: "450px", width: "500px" }}>
          <Suspense fallback={null}>
            <directionalLight position={[0, 5, 10]} />
            <Model />
          </Suspense>
        </Canvas>
      </div>
      <h1>The HODL genie</h1>
      <p>
        Enter a stock symbol and I will tell you whether to buy/hold or sell.
      </p>
      <TextField
        style={{ backgroundColor: "gray", color: "black" }}
        variant="filled"
        label="STOCK SYMBOL"
        value={symbol}
        disabled={loading}
        onChange={(e) => {
          setSymbol(e.target.value);
          if (buyOrSell) {
            setBuyOrSell(null);
          }
        }}
        InputProps={{
          style: {
            color: "black",
            backgroundColor: "white",
          },
        }}
      />
      {loading ? (
        <CircularProgress style={{ marginTop: "1rem", color: "white" }} />
      ) : (
        <Button
          onClick={fetchPrediction}
          style={{
            marginTop: "1rem",
            backgroundColor: "#006EE6",
            color: "white",
          }}
          variant="contained"
        >
          PREDICT
        </Button>
      )}
      {renderBuyOrSell()}
      <footer style={{ marginTop: "6rem", fontSize: "0.7em" }}>
        DISCLAIMER: THIS IS NOT FINANCIAL ADVICE AND IS FOR ENTERTAINMENT
        PURPOSES ONLY!
      </footer>
    </div>
  );
}

export default App;

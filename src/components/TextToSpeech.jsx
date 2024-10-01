import React, { useState, useEffect } from "react";

const TextToSpeech = ({ text }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState(null);

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (text) {
      const u = new SpeechSynthesisUtterance(text);
      setUtterance(u);
    }
    return () => {
      synth.cancel();
    };
  }, [text]);

  const handlePlay = () => {
    const synth = window.speechSynthesis;
    if (isPaused) {
      synth.resume();
    }
    synth.speak(utterance);
    setIsPaused(false);
  };

  const handleStop = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    setIsPaused(false);
  };

  // const handlePause = () => {
  //   const synth = window.speechSynthesis;
  //   synth.pause();
  //   setIsPaused(true);
  // };

  return (
    <div className="control-button">
      <button className="btn btn-custom" onClick={handlePlay}>
        {isPaused ? "Resume" : "Read"}
      </button>
      <button className="btn btn-custom" onClick={handleStop}>
        Stop
      </button>
    </div>
  );
};

export default TextToSpeech;

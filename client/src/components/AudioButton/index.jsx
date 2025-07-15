// https://stackoverflow.com/a/47686478

import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

const useAudio = (src) => {
  const [audio] = useState(new Audio());
  const [playing, setPlaying] = useState(false);

  audio.crossOrigin = "anonymous";
  audio.src = src;
  audio.type = "audio/mpeg";
  const toggle = () => setPlaying(!playing);

  useEffect(() => {
    if (playing) {
      audio.play();
    } else {
      audio.pause();
    }
  }, [playing]);

  useEffect(() => {
    audio.addEventListener('ended', () => setPlaying(false));
    return () => {
      audio.removeEventListener('ended', () => setPlaying(false));
    };
  }, []);

  return [playing, toggle];
};

const AudioButton = function AudioButton({ src, buttonPlay, buttonPause }) {
  AudioButton.propTypes = {
    src: PropTypes.string.isRequired,
  };
  const [playing, toggle] = useAudio(src);

  let buttonPlayText;
  let buttonPauseText;
  if (buttonPlay) {
    buttonPlayText = buttonPlay;
  } else {
    buttonPlayText = 'Play'
  }
  if (buttonPause) {
    buttonPauseText = buttonPause;
  } else {
    buttonPauseText = 'Pause'
  }
  return (
    <div>
      <Button autofocus onClick={toggle}>{playing ? buttonPauseText : buttonPlayText}</Button>
    </div>
  );
};

export default AudioButton;
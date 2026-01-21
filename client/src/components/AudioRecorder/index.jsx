import { useState, useRef, useEffect } from "react";
import { Button, Container, Row, Col } from 'react-bootstrap';

import { recordingUpload } from '../../services/api';

// from https://blog.logrocket.com/how-to-create-video-audio-recorder-react/

const AudioRecorder = function AudioRecorder({ questionId, saveFile, recordingText }) {
    const mediaRecorder = useRef(null);
    const [recording, setRecording] = useState(false);
    const [audioChunks, setAudioChunks] = useState([]);
    const [audio, setAudio] = useState(null);
    const [blob, setBlob] = useState(null);
    const [filename, setFilename] = useState(null);
    const mimeType = "audio/mpeg";
    const [allow, setAllow] = useState(false);
    const [audioStream, setAudioStream] = useState(null);

    useEffect(() => {
        if (allow && !audioStream) {
            setAllow(false);
        }
    }, [allow, audioStream]);

    useEffect(() => {
        if (allow && recording && audioStream) {
            recordingInProgress();
        }
    }, [allow, recording, audioStream]);

    const textOptions = {
        "startRecording": "Start Recording",
        "permissions" : "Waiting for Microphone Permissions",
        "stopRecording" : "Stop Recording",
        "download": "Download Recording"
    };

    if (recordingText) {
        for (context in recordingText) {
            textOptions[context] = recordingText[context];
        }
    }

    const onUpload = () => {
        const data = new FormData();
        data.append('path', formId);
        console.log("FORM ID: ", formId);
        data.append('wavfile', blob, filename);
        console.log("DATA: ", data);
        recordingUpload(surveyName, data);
    };

    const getMicrophonePermission = async () => {
        if ("MediaRecorder" in window) {
            try {
                const streamData = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false,
                });
                setAudioStream(streamData);
                setAllow(true);
                return "Recording";
            } catch (err) {
                alert(err.message);
            }
        } else {
            alert("The MediaRecorder API is not supported in your browser.");
        }
    };

    const startRecording = () => {
        setRecording(true);
        if (!allow) {
            getMicrophonePermission();
        }
    };

    const recordingInProgress = async () => {
        //create new Media recorder instance using the stream
        const media = new MediaRecorder(audioStream, { type: mimeType });
        //set the MediaRecorder instance to the mediaRecorder ref
        mediaRecorder.current = media;
        //invokes the start method to start the recording process
        mediaRecorder.current.start();
        let localAudioChunks = [];
        mediaRecorder.current.ondataavailable = (event) => {
            if (typeof event.data === "undefined") return;
            if (event.data.size === 0) return;
            localAudioChunks.push(event.data);
        };
        setAudioChunks(localAudioChunks);
    };

    const stopRecording = () => {
        setRecording(false);
        //stops the recording instance
        mediaRecorder.current.stop();
        let audioBlob = null;
        let audioUrl = null;
        mediaRecorder.current.onstop = () => {
            //creates a blob file from the audiochunks data
            audioBlob = new Blob(audioChunks, { type: mimeType });
            //creates a playable URL from the blob file.
            const audioUrl = URL.createObjectURL(audioBlob);
            setBlob(audioBlob);
            setAudio(audioUrl);
            setAudioChunks([]);
            const name = `${questionId}-${Date.now()}.mp3`;
            setFilename(name);
            saveFile(questionId, name, audioBlob);
        };
    };

    const getBtnText = () => {
        if (!recording) {
            return textOptions["startRecording"];
        } else if (recording && !allow) {
            return textOptions["permissions"];
        }
    };

    return (
    <div>
        <Container>
            <Row>
                <Col>
                    <div className="audio-controls">
                        { recording && allow ? (
                            <Button
                                id={questionId + "stopbtn"}
                                variant="secondary"
                                style={{"marginBottom": 3, "marginLeft": 3}}
                                onClick={stopRecording}>
                                {textOptions["stopRecording"]}
                            </Button>
                        ) : (
                            <Button
                            id={questionId + "recordbtn"}
                            variant="outline-danger"
                            style={{"marginBottom": 3}}
                            disabled={recording}
                            onClick={startRecording}>
                                { getBtnText() }
                          </Button>
                        )}
                    </div>
                </Col>
            </Row>
           { audio ? (
                <Row>
                    <Col>
                        <audio src={audio} controls></audio>
                    </Col>
                    <Col>
                        <a download href={audio}>
                            {textOptions["download"]}
                        </a>
                    </Col>
                </Row>
            ) : null }
        </Container>
    </div>
    );
};

export default AudioRecorder;
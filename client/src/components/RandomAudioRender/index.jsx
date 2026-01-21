import { useState, useEffect } from 'react';
import { Container, Card } from 'react-bootstrap';
import { shuffle, random } from 'lodash';
import PropTypes from 'prop-types';

import AudioButton from '../AudioButton';
import FormRender from '../FormRender';

const RandomAudioRender = function RandomAudioRender({ activity, onChange, onFinish }) {
    const [randomized, setRandomized] = useState([]);
    const [index, setIndex] = useState(0);
    const [responses, setResponses] = useState({});

    useEffect(() => {
        const order = []; 
        for (const element of activity.audioFiles) {
            if (Array.isArray(element)) {
                order.push(element[random(0, (element.length - 1))]);
            } else {
                order.push(element);
            }
        }
        var shuffled = order;
        if (activity.shuffle === "true") {
            shuffled = shuffle(order);
        }
        setRandomized(shuffled);
        const initialize = {}
        shuffled.forEach((obj, idx) => {
            initialize[obj["id"]] = {
                "random_order_num" : idx + 1,
                "file" : obj["file"]
            };
        });
        setResponses(initialize);
    }, [activity]);


    const nextAudio = () => {
        const nextAudioIndex = index + 1;
        const activityComplete = nextAudioIndex >= randomized.length;
        document.getElementById('card-header').scroll({ top: 0 });
        if (activityComplete) {
            for (const obj of randomized) {
                onChange(obj["id"], responses[obj["id"]]);
            }
            onFinish();
        } else {
            setIndex(nextAudioIndex);
        }
    };


    const saveResponse = (questionID, response) => {
        const currResponse = responses;
        currResponse[randomized[index]["id"]][questionID] = response;
        console.log(currResponse);
        setResponses[currResponse];
    };


    var title = "Random Audio";
    if (activity.randomAudioText) {
        title = activity.randomAudioText;
    }

    return (
        <Container>
            { randomized.length !== 0 &&
                <Card key={index}>
                    <Card.Header id="card-header">
                        <Card.Title>
                            {title} {index + 1}/{randomized.length}
                        </Card.Title>
                        <Card.Text>{activity.helpText}</Card.Text>
                        <AudioButton
                            className="random-audio-btn"
                            src={randomized[index]["file"]}
                            buttonPlay={activity.playText}
                            buttonPause={activity.pauseText}
                        />
                    </Card.Header>
                    <Card.Body>
                        <FormRender
                            questions={activity.questions}
                            onChange={saveResponse}
                            values={responses[randomized[index]["id"]]}
                            onFinish={nextAudio}
                            buttonText={activity.buttonText}
                            playText={activity.playText}
                            pauseText={activity.pauseText}
                            requiredError={activity.requiredError}
                            recordingText={activity.recordingText}
                        />
                    </Card.Body>
                </Card>
           }
        </Container>
    );
};

export default RandomAudioRender;
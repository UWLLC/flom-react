import { useState, useEffect } from 'react';
import { Container, Card } from 'react-bootstrap';
import { shuffle } from 'lodash';
import PropTypes from 'prop-types';

import AudioButton from '../AudioButton';
import FormRender from '../FormRender';

const RandomAudioRender = function RandomAudioRender({ activity, values, onChange, onFinish }) {
    const [randomized, setRandomized] = useState([]);
    const [index, setIndex] = useState(0);
    const [responses, setResponses] = useState({});

    useEffect(() => {
        const order = shuffle(activity.audioFiles);
        setRandomized(order);
        const initialize = {}
        order.forEach((file, idx) => {
            initialize[file] = {
                "random_order_num" : idx + 1
            };
        });
        setResponses(initialize);
    }, [activity]);


    const nextAudio = () => {
        const nextAudioIndex = index + 1;
        const activityComplete = nextAudioIndex >= randomized.length;
        document.getElementById('card-header').scroll({ top: 0 });
        if (activityComplete) {
            for (const file of randomized) {
                onChange(file, responses[file]);
            }
            onFinish();
        } else {
            setIndex(nextAudioIndex);
        }
    };


    const saveResponse = (questionID, response) => {
        const currResponse = responses;
        currResponse[randomized[index]][questionID] = response;
        console.log(currResponse);
        setResponses[currResponse];
    };


    return (
        <Container>
            <Card key={index}>
                <Card.Header id="card-header">
                    <Card.Title>
                        Random Audio {index + 1}/{randomized.length}
                    </Card.Title>
                    <Card.Text>{activity.helpText}</Card.Text>
                    <AudioButton
                        className="random-audio-btn"
                        src={randomized[index]}
                        buttonPlay={activity.playText}
                        buttonPause={activity.pauseText}
                    />
                </Card.Header>
                <Card.Body>
                    <FormRender
                        questions={activity.questions}
                        onChange={saveResponse}
                        values={responses[randomized[index]]}
                        onFinish={nextAudio}
                        buttonText={activity.buttonText}
                        playText={activity.playText}
                        pauseText={activity.pauseText}
                    />
                </Card.Body>
            </Card>
        </Container>
    );
};

export default RandomAudioRender;
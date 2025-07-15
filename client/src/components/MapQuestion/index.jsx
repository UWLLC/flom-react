import { useState, useEffect } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { BsPlus } from 'react-icons/bs';
import { map } from 'lodash';

import QuestionPanel from '../QuestionPanel';

const MapQuestion = function MapQuestion({
  activity,
  mode,
  values,
  fireDraw,
  onChange,
  reset,
  updateQuestionID,
  changeGIS,
  onFinish,
}) {
  const [index, setIndex] = useState(0);
  const [complete, setComplete] = useState(false);

  const initQuestions = () => {
    let result = activity.questions;
    var prompt = "Name this area";
    if (activity.prompt) {
        prompt = activity.prompt;
    }

    var cardTitle = "Draw New Area";
    if (activity.cardTitle) {
        cardTitle = activity.cardTitle;
    }

    if (activity.function === 'freedraw') {
      result = [
        {
          title: cardTitle,
          id: activity.id + index,
          questions: [
            {
              title: prompt,
              type: 'text',
              id: 'name',
            },
          ],
        },
      ];
    }

    if (activity.function === 'additional') {
      const areas = values[activity.basedOn];
      result = [];
      // eslint-disable-next-line no-return-assign
      map(
        areas,
        (area, id) =>
          (result = [
            ...result,
            {
              title: `About ${area.name}`,
              id,
              geometry: area.geometry,
              properties: area.properties,
              questions: activity.questions,
            },
          ])
      );
    }
    return result;
  };

  const [questions, setQuestions] = useState(() => initQuestions());

  useEffect(() => {
    setQuestions(initQuestions());
    setComplete(false);
  }, [activity]);

  const addMapQuestion = () => {
    const newIndex = index + 1;
    var prompt = "Name this area";
    if (activity.prompt) {
        prompt = activity.prompt;
    }

    var cardTitle = "Draw New Area";
    if (activity.cardTitle) {
        cardTitle = activity.cardTitle;
    }

    setIndex(newIndex);
    setQuestions([
      ...questions,
      {
        title: cardTitle,
        id: activity.id + newIndex,
        questions: [
          {
            title: prompt,
            type: 'text',
            id: 'name',
          },
        ],
      },
    ]);
    reset();
    setComplete(false);
  };

  const nextQuestion = () => {
    const nextQuestionIndex = index + 1;
    const activityComplete = nextQuestionIndex >= questions.length;
    document.getElementById('side').scroll({ top: 0 });
    document.getElementById('mapContainer').scroll({ top: 0 });
    if (activityComplete) {
      if (activity.function === 'freedraw') {
        setComplete(true);
      } else {
        onFinish();
      }
    } else {
      setIndex(nextQuestionIndex);
    }
  };

  return (
    <div>
      {complete ? (
        <>
          <div className="d-grid gap-2">
            <Button
              variant="outline-primary"
              style={{
                marginBottom: '20px',
                height: '139px',
              }}
              onClick={addMapQuestion}
            >
              <BsPlus /> Add Another Area
            </Button>
          </div>
          <Container>
            <Row>
              <Col align="center">
                <Button variant="primary" onClick={onFinish}>
                  { activity.buttonText ? activity.buttonText : "Next" }
                </Button>
              </Col>
            </Row>
          </Container>
        </>
      ) : (
        <Card key={questions[index].id}>
          <Card.Header>{questions[index].title}</Card.Header>
          <Card.Body>
            <QuestionPanel
              key={questions[index].id}
              noDraw={activity.function === 'additional'}
              question={questions[index]}
              values={values[activity.id]}
              fireDraw={fireDraw}
              onChange={onChange}
              updateQuestionID={updateQuestionID}
              changeGIS={changeGIS}
              onFinish={nextQuestion}
              mode={mode}
              reset={reset}
              buttonText={activity.buttonText}
              playText={activity.playText}
              pauseText={activity.pauseText}
            />
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default MapQuestion;
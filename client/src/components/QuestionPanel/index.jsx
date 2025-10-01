import { useState, useEffect, lazy, Suspense } from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { BsFillPencilFill } from 'react-icons/bs';
import Loading from '../Loading';

const FormRender = lazy(() => import('../FormRender'));

function QuestionPanel({
  noDraw,
  question,
  values,
  fireDraw,
  onChange,
  updateQuestionID,
  changeGIS,
  onFinish,
  mode,
  reset,
  buttonText,
  playText,
  pauseText,
  requiredError,
  drawText,
  drawingText
}) {
  useEffect(() => {
    if (noDraw) {
      onChange(question.id, {});
      const area = { geometry: question.geometry,
                     properties: question.properties };
      changeGIS(area);
    }
  }, [noDraw]);

  const onFormItemChange = (questionID, response) => {
    let currentResponse;
    if (values[question.id]) {
      currentResponse = values[question.id];
    }
    currentResponse[questionID] = response;
    onChange(question.id, currentResponse);
    reset();
  };

  var draw = 'Draw';
  if (drawText) {
    draw = drawText;
  }

  var drawing = 'Drawing';
  if (drawingText) {
    drawing = drawingText;
  }

  const fire = () => {
    updateQuestionID(question.id);
    fireDraw();
  };

    return (
    <>
      {!values[question.id] && !noDraw && (
        <Container>
          <Row>
            <Col align="center">
              <Button onClick={fire} disabled={mode === 'CREATE'}>
                <BsFillPencilFill />
                {mode === 'CREATE' ? drawing : draw}
              </Button>
            </Col>
          </Row>
        </Container>
      )}
      {((values[question.id] && question.questions) || noDraw) && (
        <Suspense fallback={<Loading />}>
          <FormRender
            questions={question.questions}
            onChange={onFormItemChange}
            values={values[question.id]}
            onFinish={onFinish}
            buttonText={buttonText}
            playText={playText}
            pauseText={pauseText}
            requiredError={requiredError}
          />
        </Suspense>
      )}
      {values[question.id] && !question.questions && (
        <>
          <Container>
            <Row>
              <Col align="center">
                <Button type="primary" onClick={onFinish}>
                  {buttonText ? buttonText : "Next"}
                </Button>
              </Col>
            </Row>
          </Container>
        </>
      )}
    </>
  );
}

export default QuestionPanel;

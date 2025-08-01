import { useState } from 'react';
import { Alert, Form, Button, Container, Row, Col } from 'react-bootstrap';
import { map } from 'lodash';
import PropTypes from 'prop-types';

import AudioButton from '../AudioButton';

const Label = function Label({ label, audio, required, play, pause }) {
  Label.propTypes = {
    label: PropTypes.string.isRequired,
    audio: PropTypes.string,
  };

  Label.defaultProps = {
    audio: undefined,
  };

  return (
    <Form.Label>
      {label}
        <span style={required === 'true' ? {color: "red"} : {display: "none"}}> *</span>
      {audio && <AudioButton src={audio} buttonPlay={play} buttonPause={pause}/>}
    </Form.Label>
  );
};

const FormRender = function FormRender({ questions, buttonText, onChange, onFinish, playText, pauseText }) {
  FormRender.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    questions: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    onFinish: PropTypes.func.isRequired,
  };

  const [inputs, setInputs] = useState({});
  const [hidden, setHidden] = useState(true);

  const submitResponse = (event) => {
    // Need to handle the submission to avoid
    // Form submission canceled because the form is not connected
    event.preventDefault();
    // Store the response
    map(inputs, (value, key) => {
      if (value !== undefined) {
        onChange(key, value);
      }
    });

    const respMissing = [];
    for (const question of questions) {
        if (question.required === 'true' && !inputs[question.id]) {
            respMissing.push(question.id);
        }
    }
    if (respMissing.length === 0) {
        onFinish();
    } else {
        setHidden(false);
        document.getElementById(respMissing[0]).focus();
    }
  };

const handleCheckedChange = (event) => {
    event.target.value = event.target.checked;
    handleChange(event);
};

const handleRadio = (id, value) => {
    setInputs({
      ...inputs,
      [id]: value,
    });
  };

const handleChange = (event) => {
    setInputs({
      ...inputs,
      [event.target.id]: event.target.value,
    });
    //console.log(JSON.stringify(inputs))
  };

  return (
    <Form onSubmit={submitResponse}>
      {questions.map((question) => {
        if (question.type === 'text') {
          return (
            <Form.Group className="mb-3" key={question.id}>
              <Label label={question.title} audio={question.audio} required={question.required} play={playText} pause={pauseText}/>
              <Form.Control
                type="text"
                id={question.id}
                onChange={handleChange}
              />
            </Form.Group>
          );
        }
        if (question.type === 'select') {
          return (
            <Form.Group className="mb-3" key={question.id}>
              <Label label={question.title} audio={question.audio} required={question.required} play={playText} pause={pauseText}/>
              <Form.Select
                aria-label={question.title}
                id={question.id}
                defaultValue=""
                onChange={handleChange}
              >
                <option disabled value="">
                  {' '}
                  -- select an option --{' '}
                </option>
                {question.options.map((option) => (
                    <option
                        id={option.id}
                        key={option.id}
                        value={option.id}
                    >
                    {option.text}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          );
        }
        if (question.type === 'rate') {
          return (
            <Form.Group key={question.id}>
              <Label label={question.title} audio={question.audio} required={question.required} play={playText} pause={pauseText}/>
              <Form.Range id={question.id} onChange={handleChange} />
                {question.least && question.best && (
                    <Container>
                        <Row>
                            <Col>
                                <p>{question.least}</p>
                            </Col>
                            <Col>
                                <p style={{textAlign: 'right'}}>{question.best}</p>
                            </Col>
                        </Row>
                    </Container>
                )}
            </Form.Group>
          );
        }
        if (question.type === 'num') {
          return (
            <Form.Group key={question.id}>
              <Label label={question.title} audio={question.audio} required={question.required} play={playText} pause={pauseText}/>
              <Form.Control
                type="number"
                id={question.id}
                onChange={handleChange}
              />
            </Form.Group>
          );
        }
        if (question.type === 'textarea') {
          return (
            <Form.Group key={question.id}>
              <Label label={question.title} audio={question.audio} required={question.required} play={playText} pause={pauseText}/>
              <Form.Control
                type="textarea"
                id={question.id}
                onChange={handleChange}
              />
            </Form.Group>
          );
        }
          if (question.type === 'radio') {
              //console.log(JSON.stringify(inputs))
          return (
            <Form.Group key={question.id}>
              <Label label={question.title} audio={question.audio} required={question.required} play={playText} pause={pauseText}/>
              <div key={question.id} className="mb-3">
                {question.options.map((option) => (
                  <Form.Check
                    inline
                    type="radio"
                    key={option.id}
                    id={option.id}
                    value={option.text}
                    label={option.text}
                    checked={inputs[question.id]===option.text}
                    onChange={(e) => handleRadio(question.id, option.text)}
                  />
                ))}
              </div>
            </Form.Group>
          );
        }
          if (question.type === 'boolean') {
          return (
            <Form.Group key={question.id}>
              <Label label={question.title} audio={question.audio} required={question.required} play={playText} pause={pauseText}/>
              <div key={question.id} className="mb-3">
                <Form.Check
                  inline
                  type="radio"
                  key="true"
                  id={`${question.id}`}
                  value={true}
                  checked={inputs[question.id]=== "true"}
                  label="True"
                  onChange={handleChange}
                />
                <Form.Check
                  inline
                  type="radio"
                  key="false"
                  id={`${question.id}`}
                  value={false}
                  checked={inputs[question.id]=== "false"}
                  label="False"
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
          );
        }
        if (question.type === 'checkbox') {
          return (
            <Form.Group key={question.id}>
              <Label label={question.title} audio={question.audio} required={question.required} play={playText} pause={pauseText}/>
              <div key={question.id} className="mb-3">
                {question.options.map((option) => (
                  <Form.Check
                    inline
                    type="checkbox"
                    key={option.id}
                    id={option.id}
                    label={option.text}

                        onChange={handleCheckedChange}
                  />
                ))}
              </div>
            </Form.Group>
          );
        }
        return (
          <Alert key={question.id} variant="warning">
            The question type is not one of the allowed question type.
          </Alert>
        );
      })}
      <Container style={{ marginTop: '20px' }}>
        <Row>
          <Col align="center">
            <Button variant="primary" type="submit">
              { buttonText ? buttonText : "Next" }
            </Button>
          </Col>
          <Col>
             <span style={hidden ? {display: "none"}: {color: "red"}}>*Please complete the required questions before moving to the next section.</span>
          </Col>
        </Row>
      </Container>
    </Form>
  );
};

export default FormRender;
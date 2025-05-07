import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import user from '../../services/user';
import { Menu } from '../../components/Menu';
import Loading from '../../components/Loading';

const OutputFormatter = lazy(() => import('../../components/OutputFormatter'));

function SurveyResponsePage(props) {
  const [content, setContent] = useState([]);
  const [survey, setSurvey] = useState([]);
  const { surveyId, isComplete } = useParams();

  const initialState = {
    currentPage: 0,
    isComplete: false,
    isFetching: true,
    isStart: false,
    surveyLength: 0,
    mapColor: "#b1ef8d",
  };

  const [showResp, setShowResp] = useState(initialState);

  useEffect(() => {
    user.surveyDetail(surveyId).then(
      (response) => {
        setSurvey(response.data[0].detail);
        setShowResp(setShowResp => ( {...showResp,
          currentPage: 0,
          surveyLength: response.data[0].detail.activities.length,
          isFetching: false
        }));
        // setActivity();
        //console.log(response);
      },
      (error) => {
        const _content =
          (error.response && error.response.data) ||
          error.message ||
          error.toString();
        setContent(_content);
      }
    );

    user.surveyResponse(surveyId).then(
      (response) => {
          setContent(response.data);
        //console.log(response);
      },
      (error) => {
        const _content =
          (error.response && error.response.data) ||
          error.message ||
          error.toString();
        setContent(_content);
      }
      );
  }, []);

  const getSurveyDef = () => {
    return survey;
  }

  const getRespDef = () => {
    return content;
  }

  if (showResp.isFetching) {
    return null;
  }

  const respDef = getRespDef();
  const surveyDef = getSurveyDef();

  return (
    <>
    <Menu />
      <Suspense fallback={<Loading />}>
        {respDef && surveyDef && (
          <OutputFormatter
            survey={surveyDef}
            responses={respDef}
          />
        )}
      </Suspense>
    </>
  );
}

export default SurveyResponsePage;

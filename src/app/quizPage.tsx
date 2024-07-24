"use client";
import exp from "constants";
import styles from "./page.module.css";
import { UserDataModel } from "./common/UserModel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { QuestionModel } from "./common/QuestionModel";
import { QuizStatus } from "./common/AppEnum";

type QuizPageProps = {
  submit: () => void;
  user: UserDataModel
};
const QuizPage: React.FC<QuizPageProps> = ({ submit, user }) => {
  const [selectedOption, setSelectedOption] = useState(-1);
  const [questions, setQuestions] = useState<QuestionModel[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(3);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch('/questions.json');
        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error('Error loading questions:', error);
      }
    };

    loadQuestions();
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const timerId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(timerId);
    } else {
      user.quizStatus = QuizStatus.ENDED;
      saveScoreCard();
      submit(); // End the quiz session on timeout
    }
  }, [timer]);

  const handleOptionSelection = (index: number) => {
    setSelectedOption(index);
    if (index === questions[currentQuestionIndex].answer) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      user.score += 1;
    } else {
      user.quizStatus = QuizStatus.ENDED
      saveScoreCard();
    }
    saveUserData();
  }

  const saveUserData = () => {
    sessionStorage.setItem("userData", JSON.stringify(user));
  }
  const saveScoreCard = () => {
    let scoreCard = sessionStorage.getItem('scoreCard');
    if (scoreCard && scoreCard?.length > 0) {
      let scoreCardArray: UserDataModel[] = JSON.parse(scoreCard);
      console.log(scoreCardArray);
      sessionStorage.setItem('scoreCard', JSON.stringify([...scoreCardArray, user]))
    } else {
      sessionStorage.setItem('scoreCard', JSON.stringify([user]))
    }
  }

  return (
    <>
      <div className={styles.toolbar}>
        <div>
          {user.name}
        </div>
        <div className={styles.timer}>
          <FontAwesomeIcon
            icon={faClock}
            className="fas fa-check"
            style={{ color: "yellow", fontSize: 25 }}
          />
          {`00:${timer < 10 ? `0${timer}` : timer}`}
        </div>
        <div>
          Q. {currentQuestionIndex + 1}/{questions.length}
        </div>
      </div>

      <div className={styles.questionContainer}>
        {questions[currentQuestionIndex] && (
          <>
            <div className={styles.question}>
              <div>Q{questions[currentQuestionIndex].id}.</div>
              <div>{questions[currentQuestionIndex].question}</div>
            </div>
            <div className={styles.optionContainer}>
              {questions[currentQuestionIndex].options.map((option, index) => (
                <div
                  key={index}
                  className={`${styles.option} ${selectedOption === index ? styles.active : ''}`}
                  onClick={() => handleOptionSelection(index)}
                >
                  {option}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
export default QuizPage;
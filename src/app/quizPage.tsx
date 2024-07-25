"use client";
import exp from "constants";
import styles from "./page.module.css";
import { UserDataModel } from "./common/UserModel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { QuestionModel } from "./common/QuestionModel";
import { AnswerStatus, CorrectMessage, InCorrectMessage, QuizStatus } from "./common/AppEnum";
import Lottie from 'lottie-react';
import correctAnimation from '../../public/well_done_animation1.json.json'; // Path to your animation 
import inCorrectAnimation from '../../public/incorrect_animation.json.json'; // Path to your animation


type QuizPageProps = {
  submit: () => void;
  user: UserDataModel
};
const QuizPage: React.FC<QuizPageProps> = ({ submit, user }) => {
  const [selectedOption, setSelectedOption] = useState<number>(-1);
  const [questions, setQuestions] = useState<QuestionModel[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [timer, setTimer] = useState<number>(30);
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  const [showIncAnimation, setShowIncAnimation] = useState<boolean>(false);
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>(AnswerStatus.NONE);
  const [footerMessage, setFooterMessage] = useState<string>("");
  const [showFooterMessage, setShowFooterMessage] = useState<boolean>(false);
  const [questionTransition, setQuestionTransition] = useState<'fadeIn' | 'fadeOut'>('fadeIn');

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

  useEffect(() => {
    if (answerStatus !== AnswerStatus.NONE) {
      setFooterMessage(getFooterMessage());
      setShowFooterMessage(true);
      const timer = setTimeout(() => {
        setShowFooterMessage(false);
      }, 3000); // Hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [answerStatus]);

  useEffect(() => {
    if (currentQuestionIndex > 0) {
      setQuestionTransition('fadeOut');
      const timer = setTimeout(() => {
        setQuestionTransition('fadeIn');
      }, 500); // Match this duration with the CSS animation duration
      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex]);

  const getFooterMessage = (): string => {
    let messages = answerStatus === AnswerStatus.CORRECT ? CorrectMessage : InCorrectMessage;
    let randomIndex = Math.floor(Math.random() * 3);
    return messages[randomIndex];
  }

  const handleOptionSelection = (index: number) => {
    setSelectedOption(index);
    if (index === questions[currentQuestionIndex].answer) {
      setShowAnimation(true);
      setAnswerStatus(AnswerStatus.CORRECT);
      setTimeout(() => {
        setShowAnimation(false);
        user.score += 1;
        setSelectedOption(-1)
        if (currentQuestionIndex !== questions.length - 1) {
          setTimeout(() => {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setTimer(30);
          }, 500);
          setTimer(30);
        } else {
          setQuestionTransition('fadeOut');
          submit();
        }
      }, 2500)
    } else {
      setAnswerStatus(AnswerStatus.INCORRECT);
      setShowIncAnimation(true);
      setTimeout(() => {
        setShowIncAnimation(false);
        user.quizStatus = QuizStatus.ENDED
        submit();
      }, 2500)
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

      <div className={`${styles.questionContainer} ${styles[questionTransition]}`}>
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
      {(showAnimation || showIncAnimation) && (
        <div className={styles.animationContainer}>
          <Lottie animationData={showAnimation ? correctAnimation : inCorrectAnimation} loop={false} />
        </div>
      )}
      {answerStatus !== AnswerStatus.NONE && showFooterMessage && (
        <div className={`${styles.bottomContainer} ${answerStatus === AnswerStatus.CORRECT ? styles.correct : styles.incorrect} ${styles.fadeInOut}`}>
          <div className={`${styles.bottomDiv}`}>
            {footerMessage}
          </div>
        </div>
      )}
    </>
  )
}
export default QuizPage;
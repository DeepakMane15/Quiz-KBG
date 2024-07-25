"use client";
import exp from "constants";
import styles from "./page.module.css";
import { UserDataModel } from "./common/UserModel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faStar } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { QuestionModel } from "./common/QuestionModel";
import { AnswerStatus, CorrectMessage, InCorrectMessage, QuizStatus } from "./common/AppEnum";
import Lottie from 'lottie-react';
import correctAnimation from '../../public/well_done_animation1.json.json'; // Path to your animation 
import inCorrectAnimation from '../../public/incorrect_animation.json.json'; // Path to your animation
import celebrate from '../../public/celebrate.json'; // Path to your animation
import celebrate2 from '../../public/celebrate2.json'; // Path to your animation
import Swal from 'sweetalert2';
import Image from 'next/image';

type QuizPageProps = {
  submit: () => void;
  user: UserDataModel
};
const QuizPage: React.FC<QuizPageProps> = ({ submit, user }) => {
  const [selectedOption, setSelectedOption] = useState<number>(-1);
  const [questions, setQuestions] = useState<QuestionModel[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [timer, setTimer] = useState<number>(3000);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  const [showIncAnimation, setShowIncAnimation] = useState<boolean>(false);
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>(AnswerStatus.NONE);
  const [footerMessage, setFooterMessage] = useState<string>("");
  const [showFooterMessage, setShowFooterMessage] = useState<boolean>(false);
  const [questionTransition, setQuestionTransition] = useState<'fadeIn' | 'fadeOut'>('fadeIn');
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);
  const [randomImage, setRandomImage] = useState<string>("");
  const [isWon, setIsWon] = useState<boolean>(false);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch('/questions.json');
        const data = await response.json();
        let rank1Index = Math.floor(Math.random() * data.rank1.length);
        let rank2Index = Math.floor(Math.random() * data.rank2.length);
        let rank3Index = Math.floor(Math.random() * data.rank3.length);

        let questionSet = [data.rank1[rank1Index], data.rank2[rank2Index], data.rank3[rank3Index]];
        setQuestions(questionSet);
      } catch (error) {
        console.error('Error loading questions:', error);
      }
    };

    const setUserImage = () => {
      let index = Math.floor(Math.random() * 5) + 3;
      let image = `/${index}.png`;
      setRandomImage(image);
    }

    loadQuestions();
    setUserImage();
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const timerId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      setTimerId(timerId);
      return () => clearInterval(timerId);
    } else {
      user.quizStatus = QuizStatus.ENDED;
      saveScoreCard();
      Swal.fire({
        icon: "error",
        title: "Better luck next time!",
        text: "The quiz has ended.",
        allowOutsideClick: false,
      })
        .then((result) => {
          if (result.value) {
            submit();
          }
        });
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
    if (isOptionSelected) return; // Prevent further selections

    setIsOptionSelected(true);
    setSelectedOption(index);
    if (index === questions[currentQuestionIndex].answer) {
      setShowAnimation(true);
      setAnswerStatus(AnswerStatus.CORRECT);
      user.score += 1;
      // saveScoreCard();
      setTimeout(() => {
        setShowAnimation(false);
        setSelectedOption(-1);
        if (currentQuestionIndex !== questions.length - 1) {
          setTimeout(() => {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setIsOptionSelected(false); // Reset for the next question
            setTimer(30);
          }, 500);
          // setTimer(30);
        } else {
          saveScoreCard();
          setIsWon(true);
          Swal.fire({
            icon: "success",
            title: "Winner!",
            text: "The quiz has ended.",
            allowOutsideClick: false,
          })
            .then((result) => {
              if (result.value) {
                setQuestionTransition('fadeOut');
                submit();
              }
            });
          // submit();
        }
      }, 2500)
    } else {
      setAnswerStatus(AnswerStatus.INCORRECT);
      setShowIncAnimation(true);
      if (timerId) {
        clearInterval(timerId);
      }
      setTimeout(() => {
        setShowIncAnimation(false);
        user.quizStatus = QuizStatus.ENDED
        saveScoreCard();
        Swal.fire({
          icon: "error",
          title: "Better luck next time!",
          text: "The quiz has ended.",
          allowOutsideClick: false,
        })
          .then((result) => {
            if (result.value) {
              submit();
            }
          });
      }, 2500)
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

  const calculateProgressWidth = () => {
    if (isWon)
      return 100;
    return (currentQuestionIndex / questions.length) * 100;
  }

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.name}>
          <Image className={styles.userImage} src={randomImage} height={40} width={40} alt="user" />
          {user.name}
        </div>
        <div className={styles.timer}>
          {/* <div >
            Q. {currentQuestionIndex + 1}/{questions.length} |
          </div> */}
          <FontAwesomeIcon
            icon={faClock}
            className="fas fa-check"
            style={{ color: "yellow", fontSize: 25 }}
          />
          {`00:${timer < 10 ? `0${timer}` : timer}`}
        </div>
        {/* <div className={styles.medal}>
          <div className={`${styles.timer} ${styles.medalContent}`}>
            <FontAwesomeIcon icon={faAward} className="fas fa-check"
              style={{ color: "#e71414", fontSize: 25 }} />
            <div>1st</div>
          </div>
        </div> */}
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBar}>
            <div className={styles.progress} style={{ width: `${calculateProgressWidth()}%` }}>
              <div className={styles.starIconContainer} style={{ left: `calc(${calculateProgressWidth()}% - ${!isWon ? (currentQuestionIndex === 0 ? '1.5px' : '18.5px') : '29.5px'})` }}>
                <FontAwesomeIcon icon={faStar} className={styles.starIcon} />
              </div>
            </div>
          </div>
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
                  className={`${styles.option} ${selectedOption === index && questions[currentQuestionIndex].answer === index ? styles.active :
                    selectedOption === index && questions[currentQuestionIndex].answer !== index && styles.incorrectTile
                    }`}
                  onClick={() => handleOptionSelection(index)}
                >
                  {option}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {(showIncAnimation) && (
        <>
          <div className={styles.animationContainer}>
            <Lottie animationData={inCorrectAnimation} loop={false} />
          </div>
        </>
      )}
      {answerStatus !== AnswerStatus.NONE && showFooterMessage && (
        <div className={`${styles.bottomContainer} ${answerStatus === AnswerStatus.CORRECT ? styles.correct : styles.incorrect} ${styles.fadeInOut}`}>
          <div className={`${styles.bottomDiv}`}>
            {footerMessage}
          </div>
        </div>
      )}
      {showAnimation && (
        <>
          <div className={styles.animationContainer2}>
            <Lottie animationData={showAnimation && celebrate} loop={true} />
          </div>
          <div className={styles.animationContainerLeft}>
            <Lottie animationData={showAnimation && celebrate2} loop={true} />
          </div>
          <div className={styles.animationContainerRight}>
            <Lottie animationData={showAnimation && celebrate2} loop={true} />
          </div>
        </>
      )}
    </>
  )
}
export default QuizPage;
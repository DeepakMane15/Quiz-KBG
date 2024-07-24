"use client";
import exp from "constants";
import styles from "./page.module.css";
import { UserDataModel } from "./common/UserModel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { QuestionModel } from "./common/QuestionModel";

type QuizPageProps = {
  submit: () => void;
  user: UserDataModel
};
const QuizPage: React.FC<QuizPageProps> = ({ submit, user }) => {
  const [selectedOption, setSelectedOption] = useState(0);
  const [questions, setQuestions] = useState<QuestionModel[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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


  // let currentQuestion = questions[currentQuestionIndex];

  const handleOptionSelection = (index: number) => {
    setSelectedOption(index);
    if(index === questions[currentQuestionIndex].answer)
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // currentQuestion = questions[currentQuestionIndex]; 
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
          00:59
        </div>
        <div>
          Q. 1/11
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
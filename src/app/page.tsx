"use client";

import Image from "next/image";
import styles from "./page.module.css";
import LandingPage from "./landingPage";
import { useEffect, useState } from "react";
import { QuizStatus } from "./common/AppEnum";
import QuizPage from "./quizPage";
import { UserDataModel } from "./common/UserModel";

export default function Home() {
  const [counter, setCounter] = useState(-1);
  const [quizStatus, setQuizStatus] = useState(QuizStatus.NOT_STARTED);
  const [userData, setUserData] = useState(new UserDataModel())

  useEffect(() => {
    if (counter > -1)
      if (counter > 0) {
        const timer = setTimeout(() => {
          setCounter(counter - 1);
        }, 1000);
        return () => { clearTimeout(timer); } // Clean up the timeout
      }
      else {
        setQuizStatus(QuizStatus.STARTED);
        let user = userData;
        user.quizStatus = QuizStatus.STARTED;
        setUserData(user);
        saveUserData(user);
      }
  }, [counter]);

  useEffect(() => {
    let activeUser = sessionStorage.getItem('userData');
    if (activeUser) {
      let activeUserArray: UserDataModel = JSON.parse(activeUser);

      if (activeUserArray && activeUserArray.quizStatus === QuizStatus.STARTED) {
        setUserData(activeUserArray);
        setCounter(0);
        setQuizStatus(QuizStatus.STARTED)
      } else {
        setQuizStatus(QuizStatus.NOT_STARTED)
      }
    }
  })

  const handleSubmit = (name: string) => {
    setCounter(3);
    handleUserName(name);
    setQuizStatus(QuizStatus.NOT_STARTED);
    // Add your submit logic here
  };

  const endQuiz = () => {
    setQuizStatus(QuizStatus.NOT_STARTED);
    setCounter(-1);
    sessionStorage.removeItem('userData');
  }
  const handleUserName = (name: string) => {
    let user: UserDataModel = {
      name: name,
      score: 0,
      quizStatus: QuizStatus.NOT_STARTED
    };
    // alert(name);
    setUserData(user);
    saveUserData(user);
  }

  const saveUserData = (user: UserDataModel) => {
    sessionStorage.setItem("userData", JSON.stringify(user));
  }
  return (
    <>
      {counter === -1 ? (
        <LandingPage submit={handleSubmit} />
      ) :
        quizStatus === QuizStatus.NOT_STARTED ?
          (
            <main className={styles.main}>
              <div key={counter} className={styles.counter}>
                {counter}
              </div>
            </main>
          ) :
          (<>
            <QuizPage submit={endQuiz} user={userData} />
          </>
          )
      }
    </>
  );
}

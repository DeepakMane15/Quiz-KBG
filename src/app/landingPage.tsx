"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { UserDataModel } from "./common/UserModel";
import Image from 'next/image';


type LandingPageProps = {
  submit: (name: string) => void;
};

const LandingPage: React.FC<LandingPageProps> = ({ submit }) => {
  const [name, setName] = useState("");
  const [viewScore, setViewScore] = useState(false); // Initialize to false to show form first
  const [flipClass, setFlipClass] = useState("");
  const [scoreCards, setScoreCards] = useState<UserDataModel[]>([]);

  useEffect(() => {
    if (viewScore) {
      getScoreCards();
    }
  }, [viewScore]);

  const handleStart = () => {
    if (name.trim()) {
      submit(name); // Call the submit function with the name
    } else {
      // Optionally handle empty name input case
      alert("Please enter a name.");
    }
  };

  const getScoreCardLength = () => {
    return sessionStorage.getItem("scoreCard");
  };

  const handleViewScore = () => {
    setFlipClass(styles.flip);
    setViewScore(true);
    setTimeout(() => {
      setFlipClass("");
    }, 600); // Duration of the flip animation
  };

  const handleGoBack = () => {
    setFlipClass(styles.flipBack);
    setViewScore(false);
    setTimeout(() => {
      setFlipClass("");
    }, 600); // Duration of the flipBack animation
  };

  const getScoreCards = () => {
    setScoreCards(JSON.parse(sessionStorage.getItem("scoreCard") || "[]"));
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleStart();
    }
  };

  return (
    <main className={styles.main}>
      {!viewScore ? (
        <>
          <div className={styles.description}>
            <div className={styles.title}>
              <Image className={styles.logoKbg} src="/logo_kbg.jpeg" alt="kaun banega gurusikh" width={50} height={50} />
              <span>KAUN BANEGA GURUSIKH</span></div>
          </div>
          <div className={`${styles.form} ${flipClass}`}>
            <form className={styles.content}>
              <input
                className={styles.input}
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </form>
            <div>
              <button
                disabled={name === ""}
                className={styles.glowOnHover}
                type="button"
                onClick={handleStart}
              >
                START
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className={`${styles.tableContainer} ${flipClass}`}>
          <table>
            <thead>
              <tr>
                <th>Sr</th>
                <th>Name</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {scoreCards.map((data: UserDataModel, index: number) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{data.name}</td>
                  <td>{data.score * 10}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {getScoreCardLength() && !viewScore ? (
        <div>
          <button className={`btn-hover color-1 ${flipClass}`} onClick={handleViewScore}>
            View Score Card
          </button>
        </div>
      ) : getScoreCardLength() && viewScore ? (
        <div>
          <button className={`btn-hover color-1 ${flipClass}`} onClick={handleGoBack}>
            Go Back
          </button>
        </div>
      ) : null}
    </main>
  );
};

export default LandingPage;

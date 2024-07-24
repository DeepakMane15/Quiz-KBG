"use client";
import exp from "constants";
import styles from "./page.module.css";
import { useState } from "react";
type LandingPageProps = {
  submit: (name: string) => void;
};
const LandingPage: React.FC<LandingPageProps> = ({ submit }) => {
  const [name,setName] = useState("");

  const handleStart = () => {
    if (name.trim()) {
      submit(name); // Call the submit function with the name
    } else {
      // Optionally handle empty name input case
      alert("Please enter a name.");
    }
  };
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <div className={styles.title}>
          Quiz App
        </div>
      </div>
      <div className={styles.form}>
        <form className={styles.content}>
          <label className={styles.label} >Name</label>
          <input className={styles.input} type="text" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
        </form>
        <div>
          <button className={styles.glowOnHover} type="button" onClick={handleStart}>START</button>
        </div>
      </div>
    </main>
  )
}
export default LandingPage;
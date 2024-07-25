import { QuizStatus } from "./AppEnum";

export class UserDataModel {
  name: string = "";
  score: number = 0;
  quizStatus: QuizStatus = QuizStatus.NOT_STARTED;
}

export enum QuizStatus {
    NOT_STARTED,
    STARTED,
    ENDED
}
export enum AnswerStatus {
    NONE,
    CORRECT,
    INCORRECT
}

export const CorrectMessage = ['You nailed it', 'You are on fire', 'Could you be any better!'];
export const InCorrectMessage = ['Ooppsssss!!! Hard luck, may be next time..', 'Sorryyy, that was a close one..', 'Ohhhh Nooooo!!!!'];
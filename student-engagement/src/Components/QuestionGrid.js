import React from "react";
import Question from "./Question";
export default function QuestionGrid({ questions }) {
  return (
    <div className="QuestionGrid">
      {questions.questions.map(question => (
        <Question key={question.id} question={question} />
      ))}
    </div>
  );
}
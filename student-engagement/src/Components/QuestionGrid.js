import React from "react";
import Question from "./Question";
export default function QuestionGrid({ questions }) {
  return (
    <div>
      <span className="QuestionGrid--QuestionStatement" maxLength = "20">{questions.statement}</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridGap: '2rem' }}>
        {questions.questions.map(question => (
          <Question key={question.id} question={question} />
        ))}
      </div>
    </div>
  );
}
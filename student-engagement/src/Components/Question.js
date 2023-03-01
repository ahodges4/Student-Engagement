import React, {useState, useEffect} from 'react';

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function Question({ question }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerStatus, setAnswerStatus] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState([]);

  function handleOptionSelect(option) {
    if (!hasAnswered){
      setSelectedOption(option);
    }
    
  }

  function handleConfirm() {
    if(selectedOption) {
      setHasAnswered(true);
      setAnswerStatus(selectedOption === question.answer);
    }
  }
  
  useEffect(() => {
    const options = shuffle([...question.options, ...question.extra_options, question.answer])
    setShuffledOptions(options);
  }, [question]);

  return (
    <div>
      <h2>{question.question_statement}</h2>
      {shuffledOptions.map(option => (
        <div
          key={option}
          style={{
            color: hasAnswered  && option === question.answer ? 'green' :
            hasAnswered && option === selectedOption ? 'red' : 'inherit'
          }}
        >
          <input
            type="radio"
            name={`question-${question.id}`}
            value={option}
            checked={selectedOption === option}
            onChange={() => handleOptionSelect(option)}
          />
          <label>{option}</label>
        </div>
      ))}
      
      <div>
        <button onClick={handleConfirm}>Confirm</button>
      </div>
      
      {answerStatus === false && (
        <div>
          <div>The answer is {question.answer}</div>
          <p>{question.context}</p>
        </div>
      )}
      {answerStatus === true && (
        <div>
          <div>Correct!</div>
          <p>{question.context}</p>
        </div>
      )}
    </div>
  );
}

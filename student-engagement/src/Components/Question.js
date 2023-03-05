import React, {useState, useEffect} from 'react';

// Shuffle function that takes an array and shuffles its elements randomly using the Fisher-Yates algorithm.
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// The Question component that renders a multiple-choice question with shuffled answer options, and provides feedback to the user when they select an option and confirm their answer.
export default function Question({ question }) {
  // Declare and initialize state variables using the useState hook.
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerStatus, setAnswerStatus] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState([]);

  // This function is called when a user clicks on a radio button, and it sets the `selectedOption` state variable to the clicked option, but only if the user hasn't confirmed their answer yet. 
  function handleOptionSelect(option) {
    if (!hasAnswered){
      setSelectedOption(option);
    }
  }

  // This function is called when the user clicks the "Confirm" button, and it sets the `hasAnswered` state variable to `true` and calculates whether the selected option is correct or not.
  function handleConfirm() {
    if(selectedOption) {
      setHasAnswered(true);

      setAnswerStatus(selectedOption === question.answer);
    }
  }
  
  // The useEffect hook is used to shuffle the answer options every time the `question` prop changes.
  useEffect(() => {
    const options = shuffle([...question.options, ...question.extra_options, question.answer])
    setShuffledOptions(options);
  }, [question]);

  // The component's render method returns the question statement, the shuffled answer options as radio buttons, and the "Confirm" button. 
  // It also conditionally renders feedback to the user, showing whether their answer was correct or not, and providing additional context. 
  return (
    <div className='Question'>
      <h2>{question.question_statement}</h2>
      <ul>
      {shuffledOptions.map(option => (
        <li className='Question--options'
          key={option}
          style={{
            color: hasAnswered  && option === question.answer ? 'green' :
            hasAnswered && option === selectedOption ? 'red' : 'inherit'
          }}
        >
            <input
              type="checkbox"
              name={`question-${question.id}`}
              value={option}
              checked={selectedOption === option}
              onChange={() => handleOptionSelect(option)}
            />
            <label>{option}</label>
          
        </li>
      ))}
      </ul>
      {!hasAnswered && (
        <div>
          <button className='Question--Button' id="confirm" onClick={handleConfirm}>Confirm</button>
        </div>
      )}
      
      
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

const API_KEY = "AIzaSyA6crBKIIcjw6WbG-jaobiswZXnpxYJ0T4"; // Replace with your actual API key
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

const progressBar = document.querySelector(".progress-bar"),
  progressText = document.querySelector(".progress-text"),
  startBtn = document.querySelector(".start"),
  numQuestions = document.querySelector("#num-questions"),
  category = document.querySelector("#category"),
  difficulty = document.querySelector("#difficulty"),
  timePerQuestion = document.querySelector("#time"),
  quiz = document.querySelector(".quiz"),
  startScreen = document.querySelector(".start-screen"),
  submitBtn = document.querySelector(".submit"),
  nextBtn = document.querySelector(".next"),
  endScreen = document.querySelector(".end-screen"),
  finalScore = document.querySelector(".final-score"),
  totalScore = document.querySelector(".total-score");

let questions = [],
  time = 30,
  score = 0,
  currentQuestion = 0,
  timer,
  correctAnswer = "";

// Helper function to shuffle options
function shuffleOptions(options) {
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}

// Fetch a question from Google Gemini API
async function fetchQuestion() {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `Question ${currentQuestion + 1} for MBBS quiz` }] }]
      }),
    });
    const data = await response.json();
    const questionText = data?.candidates[0].content.parts[0].text || "No question available";
    
    // Set realistic options for demonstration
    correctAnswer = "B. Arachnoid mater"; 
    const options = shuffleOptions([
      correctAnswer,
      "A. Dura mater",
      "C. Pia mater",
      "D. Subarachnoid space"
    ]);
    
    return { questionText, options };
  } catch (error) {
    console.error("Error fetching question:", error);
    return { questionText: "Failed to load question.", options: [] };
  }
}

// Initialize quiz on start button click
startBtn.addEventListener("click", startQuiz);

// Start the quiz and load the first question
function startQuiz() {
  const num = numQuestions.value;
  startScreen.classList.add("hide");
  quiz.classList.remove("hide");
  currentQuestion = 1;
  score = 0;
  loadNextQuestion();
}

// Load and display the next question
async function loadNextQuestion() {
  nextBtn.style.display = "none"; // Hide Next button during API call
  const { questionText, options } = await fetchQuestion();
  showQuestion(questionText, options);
}

function showQuestion(questionText, options) {
  const questionElement = document.querySelector(".question"),
    answersWrapper = document.querySelector(".answer-wrapper"),
    questionNumber = document.querySelector(".number");

  questionElement.innerHTML = questionText;
  answersWrapper.innerHTML = "";

  // Display options
  options.forEach(optionText => {
    const answerDiv = document.createElement("div");
    answerDiv.classList.add("answer");
    answerDiv.innerHTML = `<span class="text">${optionText}</span><span class="checkbox"><i class="fas fa-check"></i></span>`;
    answerDiv.addEventListener("click", () => selectAnswer(answerDiv, optionText));
    answersWrapper.appendChild(answerDiv);
  });

  questionNumber.innerHTML = `Question <span class="current">${currentQuestion}</span>/<span class="total">${numQuestions.value}</span>`;
  submitBtn.style.display = "block";
  time = parseInt(timePerQuestion.value);
  startTimer(time);
}

// Handle answer selection and display feedback
function selectAnswer(answerDiv, selectedAnswer) {
  const isCorrect = selectedAnswer === correctAnswer; // Check if the selected answer is correct
  answerDiv.classList.add(isCorrect ? "correct" : "wrong");
  document.querySelectorAll(".answer").forEach((div) => {
    div.classList.add("checked"); // Disable all buttons after answering
    if (div.innerText === correctAnswer) div.classList.add("correct");
  });
  submitBtn.style.display = "none";
  nextBtn.style.display = "block"; // Show Next button after selecting an answer
}

// Timer functionality
function startTimer(time) {
  timer = setInterval(() => {
    if (time >= 0) {
      progress(time);
      time--;
    } else {
      checkAnswer();
    }
  }, 1000);
}

function progress(value) {
  const percentage = (value / time) * 100;
  progressBar.style.width = `${percentage}%`;
  progressText.innerHTML = `${value}`;
}

// Check answer and load next question
function checkAnswer() {
  clearInterval(timer);
  submitBtn.style.display = "none";
  nextBtn.style.display = "block";
}

// End quiz and display score
function showScore() {
  endScreen.classList.remove("hide");
  quiz.classList.add("hide");
  finalScore.innerHTML = score;
  totalScore.innerHTML = `/ ${numQuestions.value}`;
}

// Reset the quiz
const restartBtn = document.querySelector(".restart");
restartBtn.addEventListener("click", () => {
  window.location.reload();
});

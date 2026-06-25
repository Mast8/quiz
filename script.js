// State variables
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 15;
const TIME_LIMIT = 15;

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const endScreen = document.getElementById('end-screen');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const questionText = document.getElementById('question-text');
const choicesContainer = document.getElementById('choices-container');
const progressText = document.getElementById('progress');
const timeLeftText = document.getElementById('time-left');
const finalScoreText = document.getElementById('final-score');

// Helper: Decode HTML entities from API data (e.g., &quot; -> ")
function decodeHtml(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

// 1. Fetch questions from API
async function fetchQuestions() {
    try {
        // Fetches 5 multiple-choice general knowledge questions
        const response = await fetch('https://opentdb.com/api.php?amount=5&type=multiple');
        const data = await response.json();
        
        // Transform data into a cleaner structure
        questions = data.results.map(q => {
            const formattedQuestion = {
                question: decodeHtml(q.question),
                correctAnswer: decodeHtml(q.correct_answer),
                choices: q.incorrect_answers.map(ans => decodeHtml(ans))
            };
            // Insert correct answer at a random index
            const randomIdx = Math.floor(Math.random() * 4);
            formattedQuestion.choices.splice(randomIdx, 0, formattedQuestion.correctAnswer);
            return formattedQuestion;
        });

        startQuiz();
    } catch (error) {
        questionText.innerText = "Failed to load questions. Please try again.";
        console.error(error);
    }
}

// 2. Start Quiz Logic
function startQuiz() {
    startScreen.classList.add('hide');
    endScreen.classList.add('hide');
    quizScreen.classList.remove('hide');
    currentQuestionIndex = 0;
    score = 0;
    showQuestion();
}

// 3. Render Question
function showQuestion() {
    resetState();
    const currentQuestion = questions[currentQuestionIndex];
    
    // Update progress text
    progressText.innerText = `Question ${currentQuestionIndex + 1}/${questions.length}`;
    questionText.innerText = currentQuestion.question;

    // fix last question button
    if (currentQuestionIndex === questions.length - 1) {
        nextBtn.innerText = "Finish Quiz";
    } else {
        nextBtn.innerText = "Next Question";
    }

    // Generate option buttons
    currentQuestion.choices.forEach(choice => {
        const button = document.createElement('button');
        button.innerText = choice;
        button.classList.add('btn');
        button.addEventListener('click', () => selectAnswer(button, currentQuestion.correctAnswer));
        choicesContainer.appendChild(button);
    });

    startTimer();
}

// 4. Timer Logic
function startTimer() {
    timeLeft = TIME_LIMIT;
    timeLeftText.innerText = timeLeft;
    
    timer = setInterval(() => {
        timeLeft--;
        timeLeftText.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            handleTimeout();
        }
    }, 1000);
}

// 5. Answer Selection Validation
function selectAnswer(selectedButton, correctAnswer) {
    clearInterval(timer);
    const isCorrect = selectedButton.innerText === correctAnswer;

    if (isCorrect) {
        selectedButton.classList.add('correct');
        score++;
    } else {
        selectedButton.classList.add('wrong');
        // Highlight the right answer for feedback
        revealCorrectAnswer(correctAnswer);
    }

    disableChoices();
    nextBtn.classList.remove('hide');
}

function handleTimeout() {
    revealCorrectAnswer(questions[currentQuestionIndex].correctAnswer);
    disableChoices();
    nextBtn.classList.remove('hide');
}

function revealCorrectAnswer(correctAnswer) {
    Array.from(choicesContainer.children).forEach(button => {
        if (button.innerText === correctAnswer) {
            button.classList.add('correct');
        }
    });
}

function disableChoices() {
    Array.from(choicesContainer.children).forEach(button => button.disabled = true);
}

// 6. Reset UI states between questions
function resetState() {
    clearInterval(timer);
    nextBtn.classList.add('hide');
    while (choicesContainer.firstChild) {
        choicesContainer.removeChild(choicesContainer.firstChild);
    }
}

// 7. Flow Navigation
nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showEndScreen();
    }
});


function showEndScreen() {
    quizScreen.classList.add('hide');
    endScreen.classList.remove('hide');
    finalScoreText.innerText = `You scored ${score} out of ${questions.length}`;
}

// Event Listeners for flow initiation
startBtn.addEventListener('click', fetchQuestions);
restartBtn.addEventListener('click', fetchQuestions);
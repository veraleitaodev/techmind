/*jshint esversion: 6 */

/**
 * GENERAL VARIABLES
 */
const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("ans-choice"));
const correctAnsBonus = 1;
const maxQuestions = 5;
const questionCounterDisplay = document.getElementById("question-counter");
const currentScoreDisplay = document.getElementById("current-score");
const game = document.getElementById("game-play");
const loader = document.getElementById("loader");
const username = document.getElementById("username");
const saveBtn = document.getElementById("save-high-score");
const endScore = document.getElementById("end-score");
const recentScore = localStorage.getItem("recentScore");
const highScores = JSON.parse(localStorage.getItem("highScores")) || [];
const tableBody = document.getElementById("table-body");
const correctAudio = new Audio("assets/audio/right-sound.m4a");
const incorrectAudio = new Audio("assets/audio/wrong-sound.m4a");
const audioBtn = document.getElementById("audio-btn");
const quizContentRow = document.getElementById("quizContentRow");
const factContentRow = document.getElementById("factContentRow");
const fact = document.getElementById("fact");

let availableQuestions = [];
let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = [];
//**ERROR FIX**
let saveHighScore;

/**
 * QUESTIONS
 */

let questions = [];

//Calling questions stored in db.json
fetch("db.json")
    .then(res => {
        return res.json();
    })
    //Setting pulled data into questions array
    .then(loadedQuesitons => {
        questions = loadedQuesitons;

        //Game starts AFTER questions are loaded
        startGame();
    });

/**
 * GAME PLAY
 */

// Sets audio to be 'off' at begining of game play
let music = "off";

//Sets on/off function for audio button
function toggleAudio() {
    if (music === "off") {
        music = "on";
        audioBtn.innerHTML = `<i class="fas fa-volume-up"></i>`;
    } else {
        music = "off";
        audioBtn.innerHTML = `<i class="fas fa-volume-mute"></i>`;
    }
}

function startGame() {
    availableQuestions = [...questions];
    getNewQuestion();
    console.log("startGame function")
}

function getNewQuestion() {
    //Setting maximum questions to 10
    if (questionCounter >= maxQuestions) {
        console.log("getNewQuestion saved score")
        //Save most recent score to local storage
        localStorage.setItem("recentScore", score);
        console.log("getNewQuestion redirectto end game page")
        //Redirect to end game page if no more questions to ask
        return window.location.assign("end-game.html");
    }
    //Question counter for HUD incrementing 
    questionCounter++;
    if (questionCounterDisplay !== null) {
        console.log("getNewQuestion question counter incremented")
        questionCounterDisplay.innerText = `Question ${questionCounter}`;
    }

    //Randomizes order of questions and display them in game
    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[questionIndex];
    if (question !== null) {
        console.log("getNewQuestion randomized order of questions")
        document.getElementById('image').src=currentQuestion.image;
        question.innerText = currentQuestion.question;
    }

    //Display all answer choices in game
    choices.forEach(choice => {
        console.log("getNewQuestion display all answer choices")
        const number = choice.dataset.number;
        choice.innerText = currentQuestion['ans' + number];
    });

    //Removes used question from question pool
    availableQuestions.splice(questionIndex, 1);

    //Allow user to answer
    acceptingAnswers = true;
}

choices.forEach(choice => {
    choice.addEventListener("click", e => {
        if (!acceptingAnswers) return;
        acceptingAnswers = false;
        const selectedChoice = e.target;

        //To compare selected answer number to correct answer number
        const selectedAnswer = selectedChoice.dataset.number;

        //Defining correct/incorrect to user choice  
        const selectedChoiceClass = selectedAnswer == currentQuestion.correct ? "correct" : "incorrect";

        if (selectedChoiceClass === "correct" && music === "on") {
            console.log("correct choice and music")
            updateCurrentScore(correctAnsBonus);
            correctAudio.play();
        } else if (selectedChoiceClass === "correct" && music === "off") {
            console.log("correct choice mute")
            updateCurrentScore(correctAnsBonus);
        } else if (selectedChoiceClass === "incorrect" && music === "on") {
            console.log("correct choice music")
            incorrectAudio.play();
        }

        //Add correct/incorrect class to user choice
        selectedChoice.classList.add(selectedChoiceClass);

        //Remove correct/incorrect class to user choice before fact diplayed
        setTimeout(() => {
            console.log("remove correct/incorrect classes")
            selectedChoice.classList.remove(selectedChoiceClass);
            quizContentRow.style.display = "none";
            factContentRow.style.display = "block";
            fact.innerText = currentQuestion.fact;
        }, 1000);

        //display new question when next button clicked
        document.getElementById("nextBtn").addEventListener("click", function () {
             console.log("fetching new question")
                getNewQuestion();
                quizContentRow.style.display = "flex";
                factContentRow.style.display = "none";
        });
    });
});

function updateCurrentScore(num) {
    console.log("updateCurrentScore function")
    score += num;
    currentScoreDisplay.innerText = `Score: ${score}`;
}

/**
 * END GAME
 */

//Display final score to user
if (endScore !== null) {
    console.log("display final score")
    endScore.innerText = `Final Score: ${recentScore}`;
}

//Submit button disabled until name is entered
if (username !== null) {
    console.log("submit button disabled until name is entered")
    username.addEventListener('keyup', () => {
        saveBtn.disabled = !username.value;
    });
}

/**
 * SAVE HIGH SCORES
 */

saveHighScore = (event) => {

    // Prevent form reload when save button clicked
    event.preventDefault();

    //Create key values for score
    const score = {
        score: recentScore,
        name: username.value
    };

    //Add score to highscores array
    highScores.push(score);

    //Organize scores highest to lowest
    highScores.sort((a, b) => b.score - a.score);

    //Set max saved scores to 5
    highScores.splice(5);

    //Update & save highscores to local storage
    localStorage.setItem("highScores", JSON.stringify(highScores));

    //Redirect to high scores page once submitted
    return window.location.assign("high-scores.html");
};


/**
 * HIGHSCORES
 */

if (tableBody !== null) {
    tableBody.innerHTML = highScores.map(score => {
        return `
         <tr>
             <td>${score.name}</td>
             <td>${score.score}</td>
         </tr>`;
    }).join("");
}
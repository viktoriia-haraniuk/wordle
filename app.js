const letters = document.querySelectorAll('.scoreboard-letter');
const loadingDiv = document.querySelector('.info-bar');
const headerDiv = document.querySelector('.game-name');

const ANSWER_LENGTH = 5;
const ROWS_LENGTH = 6;
const WORD_OF_THE_DAY_URL = "https://words.dev-apis.com/word-of-the-day";
const VALIDATE_WORD_URL = "https://words.dev-apis.com/validate-word";

async function init() { 
  let currentGuess = '';
  let currnentRow = 0;
  let isLoading = true;

  const wordOfTheDayRes = await fetch(WORD_OF_THE_DAY_URL);
  const wordOfTheDayObj = await wordOfTheDayRes.json();
  const wordOfTheDay = wordOfTheDayObj.word.toUpperCase();
  const wordParts = wordOfTheDay.split('');
  // const wordMap = makeMap(wordParts);
  let done = false;

  setLoading(false);
  isLoading = false;

  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH) {
      currentGuess += letter;
    } else {
      currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
    }

    letters[ANSWER_LENGTH * currnentRow + currentGuess.length - 1].innerText = letter;
  }

  async function confirmWord() {
    if (currentGuess.length !== ANSWER_LENGTH) {
      return;
    }

    isLoading = true;
    setLoading(true);
    const validateRes = await fetch(VALIDATE_WORD_URL, {
      method: "POST",
      body: JSON.stringify({word:currentGuess})
    });

    const validateResObj = await validateRes.json();
    const validWord = validateResObj.validWord;
    isLoading = false;
    setLoading(false);

    if (!validWord) {
      markInvalidWord();
      return;
    }

    const guessParts = currentGuess.split('');

    markClose(guessParts);

    currnentRow++;
    
    verifyIfWon();

    currentGuess = '';
  }

  function markInvalidWord() {
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      letters[currnentRow * ANSWER_LENGTH + i].classList.remove("invalid");
      setTimeout(function () {
        letters[currnentRow * ANSWER_LENGTH + i].classList.add("invalid");
      }, 10);
    }
  }

  function verifyIfWon() {
    if (currentGuess === wordOfTheDay) {
      alert('You won!');
      done = true;
      headerDiv.classList.add('winner');
      return;
    }

    if (currnentRow === ROWS_LENGTH) {
      alert('You loose, try again!')
      done = true;
      return;
    }
  }

  function markClose(guessParts) {
    const wordMap = makeMap(wordParts);

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        letters[currnentRow * ANSWER_LENGTH + i].classList.add("correct");
        wordMap[guessParts[i]]--;
      } else if (wordParts.includes(guessParts[i]) && wordMap[guessParts[i]] > 0) {
        letters[currnentRow * ANSWER_LENGTH + i].classList.add("close"); 
        wordMap[guessParts[i]]--;
      } else {
        letters[currnentRow * ANSWER_LENGTH + i].classList.add("wrong");
      }
    }
  }

  function eraseLetter() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[ANSWER_LENGTH * currnentRow + currentGuess.length].innerText = '';
  }

  document.addEventListener('keydown', function handleKeyPress(event) {
    if (done || isLoading) {
      return;
    }

    const action = event.key;

    if (action === 'Enter') {
      confirmWord();
    } else if (action === 'Backspace') {
      eraseLetter();
    } else if (isLetter(action)) {
      addLetter(action.toUpperCase());
    }
  })


  function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
  }

  function setLoading(isLoading) {
    loadingDiv.classList.toggle('show', isLoading)
  }
}

function makeMap(array) {
  const obj = {};
  for (let i = 0; i < array.length; i++) {
    const letter = array[i];
    if (obj[letter]) {
      obj[letter]++;
    } else {
      obj[letter] = 1;
    }
  }

  return obj;
}

init();
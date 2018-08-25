
// Game object to track variables
const game = {
	moves: 0, 
	matches: 0, 
	numberOfStars: 3,
	cardsIcons: [],
	openedCards: [],
	timeMinutes: 0,
	timeSeconds: 0,
	timeCounter: 0,
	timerIsOn: false
}

// Setting up game ui
game.ui = {};
// Score Panel
game.ui.stars = document.querySelector('.stars'); 
game.ui.starsList = document.querySelector('.stars li'); 
game.ui.moves = document.querySelector('.moves'); 
game.ui.time = document.querySelector('.time'); 
game.ui.timer = document.querySelector('.timer'); 
game.ui.restart = document.querySelector('.restart'); 
// Deck of Cards
game.ui.deck = document.querySelector('.deck'); 
game.ui.cards = document.querySelectorAll('.card'); 
game.ui.cardIcons = document.querySelectorAll('.card i'); 
// Congratulation Modal
game.ui.winDiv = document.querySelector('.win'); 
game.ui.scoreSpan = document.querySelector('.score-span'); 
game.ui.timeSpan = document.querySelector('.time-span'); 
game.ui.starRating = document.querySelector('.star-rating'); 
game.ui.play = document.querySelector('.play'); 

let action;

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
	let currentIndex = array.length, temporaryValue, randomIndex;

	while (currentIndex !== 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}


// Function populates icon array
//   - take an array of cards 
//   - take icon from inside each card 
//   - makes an array of icons
function populateCardsIcons(cardsArr) {
	let cardsIconsArr = [];
	for (const card of cardsArr) {
		cardsIconsArr.push(card.innerHTML);
	}
	return cardsIconsArr;
}


// Function to display the cards on the page
//   - shuffle the list of cards using the provided "shuffle" method below
//   - loop through each card and create its HTML
//   - add each card's HTML to the page
function resetCards() {
	game.cardsIcons = populateCardsIcons(game.ui.cards);
	game.cardsIcons = shuffle(game.cardsIcons);

	const fragment = document.createDocumentFragment();

	for (let i = 0; i<game.ui.cards.length; i++) {
		const newElement = document.createElement('li');
		newElement.classList.add('card');
		newElement.innerHTML = game.cardsIcons[i];
		fragment.appendChild(newElement);
	}

	game.ui.deck.innerHTML = ' ';
	game.ui.deck.appendChild(fragment);
}

// Function to open a card
function openCard (card) {
	card.classList.add('open', 'show');
}

// Function to hide a card
function hideCard (card1, card2) {
	card1.classList.add('animated', 'flipOutY');
	card2.classList.add('animated', 'flipOutY');
	setTimeout(function() {
		card1.classList.remove('open', 'show');
		card2.classList.remove('open', 'show');
		card1.classList.remove('animated', 'flipOutY');
		card2.classList.remove('animated', 'flipOutY');
	}, 500);
}


// Function adds a card to the list of opened cards to compare
function addToOpenCardList(card) {
	game.openedCards.push(card);
	return game.openedCards;
}

// Function marks matched cards
function matchedCards(card1, card2) {
	card1.classList.add('match');
	card2.classList.add('match');
	card1.classList.add('animated', 'tada');
	card2.classList.add('animated', 'tada');
	card1.classList.remove('open', 'show');
	card2.classList.remove('open', 'show');
	setTimeout(function() {
		card1.classList.remove('animated', 'tada');
		card2.classList.remove('animated', 'tada');
	}, 500);
}

// Function to set stars according to rating and display them in a provided place
function setStars(num, place) {
	const fragment = document.createDocumentFragment();
	for (let i = 0; i<num; i++) {
		const newElement = document.createElement('li');
		newElement.innerHTML = game.ui.starsList.innerHTML;
		fragment.appendChild(newElement);
	}
	place.innerHTML = ' ';
	place.appendChild(fragment);
}

// Function to manage the end of the game and display results
function win() {
	clearInterval(action);
	game.timerIsOn = false;
	game.ui.winDiv.style.visibility = 'visible';
	game.ui.scoreSpan.textContent = game.moves;
	game.ui.timeSpan.textContent = `${game.ui.time.textContent} min ${game.ui.timer.textContent} sec`;
	setStars(game.numberOfStars, game.ui.starRating);

	// Restart the game on 'Play again' click
	game.ui.play.addEventListener('click', function(){
		game.ui.winDiv.style.visibility = 'hidden';
		init();
	});
}

//Function to format time for displaying it
function format(number) {
	if(number < 10){
		return `0${number}`;
	}
	else {
		return number;
	}
}

// Function to display time on the page
function updateTime() {
    //1min = 60*100centisec = 6000centisec
    game.timeMinutes = Math.floor(game.timeCounter/60);
    //1sec = 100centisec
    //timeSeconds = Math.floor(timeCounter%60);
    game.timeSeconds = Math.floor(game.timeCounter%60);
    
    game.ui.time.textContent = (format(game.timeMinutes));
    game.ui.timer.textContent = (format(game.timeSeconds));
}

// Function to set timer 
function setTimer() {
	game.timeCounter = 0;
	action = setInterval(function(){
		game.timeCounter++;
		updateTime();
	}, 1000);
}

// Function to compare two cards
function compareCards(card1, card2) {
// If two cards match
if (card1.firstElementChild.classList[1] === card2.firstElementChild.classList[1]) {
	game.matches+=1;
	matchedCards(card1, card2);

	// If all cards are guessed
	if (game.matches === 8) {
		win();
	}
} 
	// If cards don't match
	else {
		hideCard(card1, card2); 
	}
	// Delete the card from the opened card array
	game.openedCards.pop();
	game.openedCards.pop(); 
}

// Manage star rating depending on moves counter
function manageStarRating(moves) {
	if (moves > 30 && moves < 35) {
		setStars(2, game.ui.stars);
		game.numberOfStars = 2;
	} else if (moves > 35) {
		setStars(1, game.ui.stars);
		game.numberOfStars = 1;
	}
}


// Function to manage events of cards click and to run main logic of the game
function setUpCards() {

	// Store current position of cards
	game.ui.cards = document.querySelectorAll('.card'); //cards1

	// Tracking clicks on cards
	game.ui.cards.forEach((card) => {
		card.addEventListener('click', function() {
			let currentCard = this;

			// Set the timer if it was not set yet 
			if (!game.timerIsOn) {
				game.timerIsOn = true;
				setTimer();
			} 

			// Run the logic only if it's a new card (not the opened one and not matched)
			if (currentCard.classList.length == 1) {
				openCard(currentCard);
				game.openedCards = addToOpenCardList(currentCard);

				// Increment moves couner
				game.moves+=1;
				// Display moves counter
				game.ui.moves.textContent = game.moves;

				// If opened card array is not empty, we are looking for a match for the card stored there
				if (game.openedCards.length > 1) {
					// Compare cards
					compareCards(game.openedCards[0], game.openedCards[1]);

					// Manage star rating 
					manageStarRating(game.moves);
				} 
			}
		});
	});
}

// Function to reset displayed values and settings
function reset(){
	resetCards();
	game.moves = 0;
	game.matches = 0;
	clearInterval(action);
	game.ui.time.textContent = '00';
	game.ui.timer.textContent = '00';
	game.ui.moves.textContent = game.moves;
	game.openedCards = [];
	setStars(3, game.ui.stars);
	game.numberOfStars = 3;
	game.timerIsOn = false;
}


// Function to initialize the game
function init() {
	reset();
	setUpCards();
}

// Restart the game on click 'restart'
game.ui.restart.addEventListener("click",function(){
	init();
});

// Start the game
init();


// Game State
let gameState = {
    deck: [],
    playerHand: [],
    dealerHand: [],
    bankroll: 1000,
    currentBet: 0,
    gameInProgress: false
};

// DOM Elements
const dealerHandEl = document.getElementById('dealer-hand');
const playerHandEl = document.getElementById('player-hand');
const dealerScoreEl = document.getElementById('dealer-score');
const playerScoreEl = document.getElementById('player-score');
const bankrollEl = document.getElementById('bankroll');
const messageEl = document.getElementById('message');
const betControls = document.querySelector('.bet-controls');
const gameControls = document.querySelector('.game-controls');
const newGameBtn = document.getElementById('new-game');

// Card suits and values
const suits = ['♠', '♥', '♦', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const cardValues = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11
};

// Initialize the game
function initGame() {
    // Set up event listeners
    document.getElementById('place-bet').addEventListener('click', startGame);
    document.getElementById('hit').addEventListener('click', hit);
    document.getElementById('stand').addEventListener('click', stand);
    document.getElementById('double-down').addEventListener('click', doubleDown);
    newGameBtn.addEventListener('click', resetGame);
    
    // Quick bet buttons
    document.querySelectorAll('.bet-controls button:not(#place-bet)').forEach(button => {
        button.addEventListener('click', (e) => {
            if (e.target.id.startsWith('bet-')) {
                const amount = parseInt(e.target.id.split('-')[1]);
                document.getElementById('custom-bet').value = amount;
            }
        });
    });
    
    updateBankroll();
    showMessage('Place your bet to start playing!');
}

// Create a new deck
function createDeck() {
    const deck = [];
    for (let i = 0; i < 6; i++) { // 6 decks
        for (let suit of suits) {
            for (let value of values) {
                deck.push({ suit, value });
            }
        }
    }
    return shuffleDeck(deck);
}

// Shuffle the deck
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// Calculate hand value
function calculateHandValue(hand) {
    let value = 0;
    let aces = 0;
    
    hand.forEach(card => {
        value += cardValues[card.value];
        if (card.value === 'A') aces++;
    });
    
    // Adjust for aces
    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }
    
    return value;
}

// Deal a card
function dealCard(isDealer = false, isHidden = false) {
    if (gameState.deck.length < 10) {
        gameState.deck = createDeck();
        showMessage('Shuffling deck...');
    }
    
    return gameState.deck.pop();
}

// Create card element
function createCardElement(card, isHidden = false) {
    const cardEl = document.createElement('div');
    const isRed = card.suit === '♥' || card.suit === '♦';
    
    cardEl.className = `card ${isRed ? 'red' : 'black'} ${!isHidden ? 'dealt' : ''}`;
    
    if (isHidden) {
        cardEl.className = 'card back';
        cardEl.textContent = '🂠';
    } else {
        cardEl.textContent = `${card.value}${card.suit}`;
    }
    
    return cardEl;
}

// Update the UI
function updateUI() {
    // Clear hands
    dealerHandEl.innerHTML = '';
    playerHandEl.innerHTML = '';
    
    // Show dealer's cards
    gameState.dealerHand.forEach((card, index) => {
        const isHidden = index === 0 && gameState.gameInProgress && gameState.dealerHand.length > 1;
        dealerHandEl.appendChild(createCardElement(card, isHidden));
    });
    
    // Show player's cards
    gameState.playerHand.forEach(card => {
        playerHandEl.appendChild(createCardElement(card));
    });
    
    // Update scores
    const playerScore = calculateHandValue(gameState.playerHand);
    playerScoreEl.textContent = playerScore;
    
    if (gameState.gameInProgress && gameState.dealerHand.length > 1) {
        dealerScoreEl.textContent = '?';
    } else {
        const dealerScore = calculateHandValue(gameState.dealerHand);
        dealerScoreEl.textContent = dealerScore;
    }
    
    // Highlight scores if bust or blackjack
    if (playerScore > 21) {
        playerScoreEl.style.color = 'var(--card-red)';
    } else if (playerScore === 21 && gameState.playerHand.length === 2) {
        playerScoreEl.style.color = 'var(--accent-color)';
    } else {
        playerScoreEl.style.color = 'white';
    }
}

// Start a new game
function startGame() {
    const betInput = document.getElementById('custom-bet');
    const bet = parseInt(betInput.value);
    
    if (isNaN(bet) || bet < 5) {
        showMessage('Minimum bet is $5!', 'error');
        return;
    }
    
    if (bet > gameState.bankroll) {
        showMessage('You don\'t have enough money!', 'error');
        return;
    }
    
    // Reset game state
    gameState.currentBet = bet;
    gameState.playerHand = [];
    gameState.dealerHand = [];
    gameState.gameInProgress = true;
    
    // Create and shuffle deck if needed
    if (gameState.deck.length < 20) {
        gameState.deck = createDeck();
    }
    
    // Deal initial cards
    gameState.playerHand.push(dealCard());
    gameState.dealerHand.push(dealCard(true, true)); // Hidden card
    gameState.playerHand.push(dealCard());
    gameState.dealerHand.push(dealCard());
    
    // Update UI
    updateUI();
    updateBankroll();
    
    // Show game controls
    betControls.style.display = 'none';
    gameControls.style.display = 'flex';
    newGameBtn.style.display = 'none';
    
    // Check for blackjack (Ace + 10/J/Q/K)
    const playerScore = calculateHandValue(gameState.playerHand);
    const isBlackjack = (playerScore === 21 && 
                        gameState.playerHand.length === 2 && 
                        ((gameState.playerHand[0].value === 'A' && ['10', 'J', 'Q', 'K'].includes(gameState.playerHand[1].value)) ||
                         (gameState.playerHand[1].value === 'A' && ['10', 'J', 'Q', 'K'].includes(gameState.playerHand[0].value))));
    
    if (isBlackjack) {
        // Player has blackjack, check if dealer also has blackjack
        const dealerScore = calculateHandValue([gameState.dealerHand[1]]); // Only check dealer's up card
        if (dealerScore === 10) {
            // Dealer might have blackjack, need to check
            setTimeout(() => dealerTurn(), 1000);
        } else {
            // Player wins 1.5x for blackjack
            endGame('blackjack');
        }
    } else if (playerScore === 21) {
        // 21 but not blackjack (more than 2 cards)
        setTimeout(() => dealerTurn(), 1000);
    } else {
        showMessage('Hit or Stand?');
    }
}

// Player hits
function hit() {
    if (!gameState.gameInProgress) return;
    
    gameState.playerHand.push(dealCard());
    updateUI();
    
    const playerScore = calculateHandValue(gameState.playerHand);
    
    if (playerScore > 21) {
        // Player busts
        endGame('bust');
    } else if (playerScore === 21) {
        // Player can't hit on 21
        stand();
    }
}

// Player stands
function stand() {
    if (!gameState.gameInProgress) return;
    dealerTurn();
}

// Double down
function doubleDown() {
    if (!gameState.gameInProgress || gameState.playerHand.length > 2) return;
    
    if (gameState.currentBet * 2 > gameState.bankroll) {
        showMessage('Not enough money to double down!', 'error');
        return;
    }
    
    gameState.currentBet *= 2;
    updateBankroll();
    
    // Take one more card and stand
    hit();
    if (gameState.gameInProgress) {
        stand();
    }
}

// Dealer's turn
function dealerTurn() {
    gameState.gameInProgress = false;
    updateUI(); // Reveal dealer's hidden card
    
    const dealerScore = calculateHandValue(gameState.dealerHand);
    const playerScore = calculateHandValue(gameState.playerHand);
    
    // Check for dealer blackjack
    if (dealerScore === 21 && gameState.dealerHand.length === 2) {
        if (playerScore === 21 && gameState.playerHand.length === 2) {
            // Both have blackjack - push
            endGame('push');
        } else {
            // Dealer has blackjack
            endGame('dealer_blackjack');
        }
        return;
    }
    
    // Dealer draws until 17 or higher
    const drawCard = () => {
        if (dealerScore >= 17) {
            // Dealer stands
            endGame();
            return;
        }
        
        // Dealer hits
        setTimeout(() => {
            gameState.dealerHand.push(dealCard(gameState.dealerHand));
            updateUI();
            
            const newDealerScore = calculateHandValue(gameState.dealerHand);
            
            if (newDealerScore > 21) {
                // Dealer busts
                endGame('dealer_bust');
            } else if (newDealerScore >= 17) {
                // Dealer stands
                endGame();
            } else {
                // Continue drawing
                drawCard();
            }
        }, 750);
    };
    
    drawCard();
}

// End the game
function endGame(result = null) {
    gameState.gameInProgress = false;
    
    const playerScore = calculateHandValue(gameState.playerHand);
    const dealerScore = calculateHandValue(gameState.dealerHand);
    
    // Determine the result if not provided
    if (!result) {
        if (playerScore > 21) {
            result = 'bust';
        } else if (dealerScore > 21) {
            result = 'dealer_bust';
        } else if (playerScore > dealerScore) {
            result = 'win';
        } else if (playerScore < dealerScore) {
            result = 'lose';
        } else {
            result = 'push';
        }
    }
    
    // Update bankroll based on result
    switch (result) {
        case 'blackjack':
            gameState.bankroll += Math.floor(gameState.currentBet * 1.5);
            showMessage('Blackjack! You win ' + Math.floor(gameState.currentBet * 1.5) + '!', 'win');
            break;
        case 'win':
            gameState.bankroll += gameState.currentBet;
            showMessage('You win ' + gameState.currentBet + '!', 'win');
            break;
        case 'lose':
            gameState.bankroll -= gameState.currentBet;
            showMessage('Dealer wins!', 'lose');
            break;
        case 'bust':
            gameState.bankroll -= gameState.currentBet;
            showMessage('Bust! You lose ' + gameState.currentBet, 'lose');
            break;
        case 'dealer_blackjack':
            gameState.bankroll -= gameState.currentBet;
            showMessage('Dealer has blackjack!', 'lose');
            break;
        case 'dealer_bust':
            gameState.bankroll += gameState.currentBet;
            showMessage('Dealer busts! You win ' + gameState.currentBet + '!', 'win');
            break;
        case 'push':
            showMessage('Push! Your bet is returned.', 'push');
            break;
    }
    
    // Update UI
    updateBankroll();
    
    // Show new game button
    betControls.style.display = 'none';
    gameControls.style.display = 'none';
    newGameBtn.style.display = 'block';
    
    // Check if player can continue
    if (gameState.bankroll < 5) {
        showMessage('Game over! You\'re out of money!', 'error');
    }
}

// Reset the game
function resetGame() {
    gameState.playerHand = [];
    gameState.dealerHand = [];
    gameState.currentBet = 0;
    gameState.gameInProgress = false;
    
    // Reset UI
    dealerHandEl.innerHTML = '';
    playerHandEl.innerHTML = '';
    dealerScoreEl.textContent = '0';
    playerScoreEl.textContent = '0';
    playerScoreEl.style.color = 'white';
    
    // Show bet controls
    betControls.style.display = 'flex';
    gameControls.style.display = 'none';
    newGameBtn.style.display = 'none';
    
    showMessage('Place your bet to start a new game!');
}

// Update bankroll display
function updateBankroll() {
    bankrollEl.textContent = gameState.bankroll;
}

// Show message
function showMessage(msg, type = 'info') {
    messageEl.textContent = msg;
    messageEl.className = 'message';
    
    switch (type) {
        case 'error':
            messageEl.style.color = '#ff6b6b';
            messageEl.style.border = '2px solid #ff6b6b';
            break;
        case 'win':
            messageEl.style.color = '#51cf66';
            messageEl.style.border = '2px solid #51cf66';
            break;
        case 'lose':
            messageEl.style.color = '#ff6b6b';
            messageEl.style.border = '2px solid #ff6b6b';
            break;
        case 'push':
            messageEl.style.color = '#fcc419';
            messageEl.style.border = '2px solid #fcc419';
            break;
        default:
            messageEl.style.color = 'white';
            messageEl.style.border = '2px solid rgba(255, 255, 255, 0.2)';
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameState.gameInProgress) return;
    
    switch (e.key.toLowerCase()) {
        case 'h':
            hit();
            break;
        case 's':
            stand();
            break;
        case 'd':
            doubleDown();
            break;
    }
});

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', initGame);

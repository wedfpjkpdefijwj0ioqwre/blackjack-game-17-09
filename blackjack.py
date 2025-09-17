import random
import os
import time
from typing import List, Dict, Tuple, Optional

# Define card values and suits
CARD_VALUES = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, 
    '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11
}
SUITS = ['♠', '♥', '♦', '♣']

class Card:
    def __init__(self, suit: str, rank: str):
        self.suit = suit
        self.rank = rank
        self.value = CARD_VALUES[rank]
    
    def __str__(self) -> str:
        return f"{self.rank}{self.suit}"

class Deck:
    def __init__(self, num_decks: int = 1):
        self.cards = []
        self.num_decks = num_decks
        self.reset()
    
    def reset(self) -> None:
        self.cards = []
        for _ in range(self.num_decks):
            for suit in SUITS:
                for rank in CARD_VALUES.keys():
                    self.cards.append(Card(suit, rank))
        random.shuffle(self.cards)
    
    def draw(self) -> Card:
        if len(self.cards) < 10:  # Reshuffle if running low on cards
            print("Reshuffling deck...")
            self.reset()
        return self.cards.pop()

class Hand:
    def __init__(self):
        self.cards: List[Card] = []
        self.value = 0
        self.aces = 0
    
    def add_card(self, card: Card) -> None:
        self.cards.append(card)
        self.value += card.value
        if card.rank == 'A':
            self.aces += 1
        self.adjust_for_ace()
    
    def adjust_for_ace(self) -> None:
        while self.value > 21 and self.aces:
            self.value -= 10
            self.aces -= 1
    
    def __str__(self) -> str:
        return ' '.join(str(card) for card in self.cards)

class BlackjackGame:
    def __init__(self):
        self.deck = Deck(6)  # Using 6 decks
        self.player_hand = Hand()
        self.dealer_hand = Hand()
        self.bankroll = 1000
        self.current_bet = 0
    
    def place_bet(self) -> bool:
        while True:
            try:
                print(f"\nBankroll: ${self.bankroll}")
                bet = int(input("Place your bet (or 0 to quit): $"))
                
                if bet == 0:
                    return False
                if bet < 5:
                    print("Minimum bet is $5!")
                elif bet > self.bankroll:
                    print("You don't have enough money for that bet!")
                else:
                    self.current_bet = bet
                    return True
            except ValueError:
                print("Please enter a valid number!")
    
    def deal_initial_cards(self) -> None:
        self.player_hand = Hand()
        self.dealer_hand = Hand()
        
        for _ in range(2):
            self.player_hand.add_card(self.deck.draw())
            self.dealer_hand.add_card(self.deck.draw())
    
    def player_turn(self) -> bool:
        while True:
            print(f"\nYour hand: {self.player_hand} (Value: {self.player_hand.value})")
            print(f"Dealer's hand: {self.dealer_hand.cards[0]} ?")
            
            if self.player_hand.value == 21:
                print("Blackjack!")
                return False
                
            action = input("\nWould you like to (H)it or (S)tand? ").lower()
            
            if action == 'h':
                self.player_hand.add_card(self.deck.draw())
                if self.player_hand.value > 21:
                    print(f"\nBust! Your hand: {self.player_hand} (Value: {self.player_hand.value})")
                    return False
            elif action == 's':
                return False
            else:
                print("Invalid input. Please enter 'H' to Hit or 'S' to Stand.")
    
    def dealer_turn(self) -> None:
        print(f"\nDealer's hand: {self.dealer_hand} (Value: {self.dealer_hand.value})")
        
        while self.dealer_hand.value < 17:
            time.sleep(1)
            self.dealer_hand.add_card(self.deck.draw())
            print(f"Dealer hits: {self.dealer_hand} (Value: {self.dealer_hand.value})")
        
        if self.dealer_hand.value > 21:
            print("Dealer busts!")
    
    def determine_winner(self) -> None:
        player_value = self.player_hand.value
        dealer_value = self.dealer_hand.value
        
        print(f"\nYour hand: {self.player_hand} (Value: {player_value})")
        print(f"Dealer's hand: {self.dealer_hand} (Value: {dealer_value})")
        
        if player_value > 21:
            print("You bust! You lose your bet.")
            self.bankroll -= self.current_bet
        elif dealer_value > 21:
            print("Dealer busts! You win!")
            self.bankroll += self.current_bet
        elif player_value > dealer_value:
            print("You win!")
            self.bankroll += self.current_bet
        elif player_value < dealer_value:
            print("Dealer wins!")
            self.bankroll -= self.current_bet
        else:
            print("It's a push! Your bet is returned.")
        
        print(f"\nYour bankroll: ${self.bankroll}")
    
    def play(self) -> None:
        print("Welcome to Blackjack!")
        print("Rules:")
        print("- Try to get as close to 21 as possible without going over.")
        print("- Face cards are worth 10. Aces are worth 1 or 11.")
        print("- Dealer must hit on 16 and stand on 17.")
        print("-" * 40)
        
        while self.bankroll >= 5:  # Minimum bet is $5
            if not self.place_bet():
                break
                
            self.deal_initial_cards()
            
            # Check for blackjack
            if self.player_hand.value == 21:
                print("\nYour hand:", self.player_hand)
                print("Dealer's hand:", self.dealer_hand)
                if self.dealer_hand.value == 21:
                    print("Both you and the dealer have blackjack! It's a push!")
                else:
                    print("Blackjack! You win 1.5x your bet!")
                    self.bankroll += int(self.current_bet * 1.5)
                continue
            
            # Player's turn
            self.player_turn()
            
            # If player didn't bust, dealer's turn
            if self.player_hand.value <= 21:
                self.dealer_turn()
            
            # Determine winner
            self.determine_winner()
            
            # Check if player can continue
            if self.bankroll < 5:
                print("\nYou don't have enough money for the minimum bet!")
                break
                
            play_again = input("\nWould you like to play again? (Y/N): ").lower()
            if play_again != 'y':
                break
        
        print(f"\nThanks for playing! You're leaving with ${self.bankroll}")

if __name__ == "__main__":
    game = BlackjackGame()
    game.play()

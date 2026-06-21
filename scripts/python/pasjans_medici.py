#!/usr/bin/env python3
"""
Pasjans Medici Simulator (Dreamhackers metoda).

Uporaba:
    python3 pasjans_medici.py [max_attempts]

    max_attempts - največje število poskusov zlaganja (privzeto: 10000)
"""

import random
import sys
from datetime import datetime

SYMBOLS = {
    "H": "Srca (čustvene izkušnje: naklonjenost, odboj, strašljive zgodbe)",
    "D": "Kara (finančni vidiki, materialna blaginja)",
    "C": "Križi (družbena aktivnost, delo, potovanja)",
    "S": "Piki (manifestacija volje, agresija, ovire in njihovo premagovanje)",
}

VALUES = {
    "A": "As (zunanja sila, element ali okoliščine, ki vplivajo na nas)",
    "K": "Kralj (zakon, svetovni nazor, standardi, ki določajo naše odzive)",
    "Q": "Kraljica (ljudje, živali ali predmeti, ki z nami interagirajo)",
    "J": "Poba (osebni motivi, želje, namere, ki nas vodijo k dejanjem)",
    "10": "Desetica (stabilnost, vrhunec določenega vidika)",
    "9": "Devetica (razvoj, bližanje cilju)",
    "8": "Osem (ravnovesje, harmonija)",
    "7": "Sedmica (izzivi, duhovni vidik)",
    "6": "Šestica (harmonija, sodelovanje)",
    "5": "Petica (nestabilnost, spremembe)",
    "4": "Štirica (struktura, stabilnost)",
    "3": "Trojka (rast, ustvarjalnost)",
    "2": "Dvojka (dualnost, odločitve)",
}

DREAM_LOCATIONS = {
    "H": "Morje (simbol čustev, svobode) ali hiša (simbol varnosti, intimnosti)",
    "D": "Zlato polje (simbol obilja) ali banka (simbol financ)",
    "C": "Mesto (simbol družbene aktivnosti) ali pot (simbol potovanja)",
    "S": "Temen gozd (simbol izzivov, strahov) ali gora (simbol premagovanja ovir)",
}


def create_deck():
    suits = ["H", "D", "C", "S"]
    values = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"]
    return [value + suit for suit in suits for value in values]


def shuffle_deck(deck):
    random.shuffle(deck)
    return deck


def play_medici_patience(max_attempts=10000):
    deck = create_deck()
    attempts = 0
    chain = []

    print("Začetek zlaganja Pasjanse Medici...")

    while attempts < max_attempts:
        attempts += 1
        deck = shuffle_deck(deck.copy())
        chain = deck[:5]

        suits_in_chain = len(set(card[-1] for card in chain))
        strong_cards = sum(1 for card in chain if card[:-1] in ["A", "K", "Q", "J"])

        if suits_in_chain >= 2 and strong_cards >= 1:
            print(f"\nUspešna razporeditev najdena po {attempts} poskusih!")
            return chain, attempts

        if attempts % 1000 == 0:
            print(f"Poskus {attempts}/{max_attempts}...")

    print(f"\nNi uspelo najti smiselne razporeditve po {max_attempts} poskusih.")
    return chain, attempts


def interpret_chain(chain):
    print("\nInterpretacija verige kart:")
    for i, card in enumerate(chain):
        value = card[:-1]
        suit = card[-1]

        print(f"Karta {i + 1}: {card}")
        print(f" - Simbolika: {SYMBOLS[suit]}")
        print(f" - Vrednost: {VALUES[value]}")
        print(f" - Možna sanjska lokacija: {DREAM_LOCATIONS[suit]}")

        if suit == "H":
            print("  - Podzavestni vzorec: Osredotočite se na čustva. Ali čutite naklonjenost ali odboj do nečesa v budnem življenju?")
        elif suit == "D":
            print("  - Podzavestni vzorec: Razmislite o svojem odnosu do denarja in obilja. Ali so finančni strahovi prisotni?")
        elif suit == "C":
            print("  - Podzavestni vzorec: Kako družbena aktivnost vpliva na vas? Ste preobremenjeni z delom ali potovanji?")
        elif suit == "S":
            print("  - Podzavestni vzorec: So v vašem življenju prisotni izzivi ali ovire? Kako jih lahko premagate?")

        print()


def save_result(chain, attempts):
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"pasjans_medici_{timestamp}.txt"

    with open(filename, "w", encoding="utf-8") as f:
        f.write("Pasjans Medici - Rezultat zlaganja\n")
        f.write(f"Poskusi: {attempts}\n")
        f.write("Veriga kart:\n")
        for i, card in enumerate(chain):
            f.write(f"Karta {i + 1}: {card}\n")
            value = card[:-1]
            suit = card[-1]
            f.write(f" - Simbolika: {SYMBOLS[suit]}\n")
            f.write(f" - Vrednost: {VALUES[value]}\n")
            f.write(f" - Možna sanjska lokacija: {DREAM_LOCATIONS[suit]}\n")
            f.write("\n")

    print(f"Rezultat shranjen v datoteko: {filename}")


def main():
    print("=== Pasjans Medici Simulator ===")
    print("Simulacija zlaganja Pasjanse Medici po metodi Dreamhackers.\n")

    max_attempts = int(sys.argv[1]) if len(sys.argv) > 1 else 10000

    chain, attempts = play_medici_patience(max_attempts=max_attempts)

    if chain:
        print("\nKončna veriga kart:")
        print(" -> ".join(chain))

        interpret_chain(chain)
        save_result(chain, attempts)

        print("\nPredlog za sanjsko namero:")
        suit = chain[0][-1]
        location = DREAM_LOCATIONS[suit].split(" (")[0]
        print(f"Pred spanjem vizualizirajte lokacijo: {location}.")
        print(f"Postavite namero: 'Nocoj bom obiskal {location}, raziskal svoja čustva in vedel, da sanjam.'")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Spletni tečaj kartografije sanj - CLI verzija.

Prepisano iz prvotne tkinter GUI aplikacije (dream_cartography_course.py).
Tkinter okno, platno za slike kart in gumbi so odstranjeni, ker serverless
okolje (in dashboard na splošno) ne zna prikazati lokalnega GUI okna -
logika tečaja (simbolika, Pasjans Medici, interpretacija) je nespremenjena.

Uporaba:
    python3 dream_cartography_cli.py <modul>

    <modul> je ena od: 1, 2, 3, 4 ali "vse" (privzeto: vse)

Modul 3 in 4 sta v originalu delila stanje (modul 3 ustvari verigo kart,
modul 4 jo interpretira). Ker CLI klici nimajo skupnega stanja med zagoni,
ta verzija pri "vse" / modulu 4 verigo ustvari sproti, če še ni podana.
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


def play_medici_patience(max_attempts=10000):
    deck = create_deck()
    attempts = 0
    chain = []

    while attempts < max_attempts:
        attempts += 1
        random.shuffle(deck)
        chain = deck[:5]

        suits_in_chain = len(set(card[-1] for card in chain))
        strong_cards = sum(1 for card in chain if card[:-1] in ["A", "K", "Q", "J"])

        if suits_in_chain >= 2 and strong_cards >= 1:
            return chain, attempts

    return chain, attempts


def module_1():
    print("=== Modul 1: Uvod v kartografijo sanj ===")
    print(
        "Kartografija sanj je umetnost in znanost ustvarjanja zemljevidov "
        "sanjskega prostora. Namen je modelirati, dokumentirati in "
        "vizualizirati sanje na abstrakten, a smiseln način."
    )
    print(
        "Sanje so edinstvene, saj sanjskega prostora ni mogoče zavestno "
        "ponovno obiskati. Zato kartografija sanj uporablja simboliko in "
        "abstrakcijo za prikaz sanjskih elementov."
    )
    print(
        "V tem tečaju bomo uporabili metode Dreamhackerjev, kot je Pasjans "
        "Medici, za razumevanje in vizualizacijo sanj."
    )
    print(
        "\nNaloga: Razmislite o zadnjih sanjah, ki ste jih imeli. Katere "
        "lokacije ali simboli so bili prisotni? Zapišite jih v beležko."
    )


def module_2():
    print("=== Modul 2: Simbolika sanj in Pasjans Medici ===")
    print(
        "Dreamhackerji so razvili metodo Pasjans Medici, ki uporablja "
        "karte za razumevanje podzavesti in vplivanje na budno resničnost."
    )
    print("Vsaka karta nosi simboličen pomen:")
    print("- Srca: Čustva (naklonjenost, odboj)")
    print("- Kara: Finance, materialna blaginja")
    print("- Križi: Družbena aktivnost, potovanja")
    print("- Piki: Volja, izzivi, ovire")
    print("\nVrednosti kart prav tako nosijo pomen:")
    print("- As: Zunanja sila")
    print("- Kralj: Svetovni nazor")
    print("- Kraljica: Osebe ali predmeti")
    print("- Poba: Osebni motivi")
    print(
        "\nV naslednjem modulu bomo uporabili Pasjans Medici za "
        "ustvarjanje sanjskega zemljevida."
    )


def module_3(verbose=True):
    print("=== Modul 3: Praktična vaja – Ustvarjanje sanjskega zemljevida ===")
    print("V tej vaji bomo zložili Pasjans Medici in ustvarili sanjski zemljevid.")

    chain, attempts = play_medici_patience(max_attempts=10000)

    if not chain:
        print(f"\nNi uspelo najti smiselne razporeditve po {attempts} poskusih.")
        return None, attempts

    print(f"\nUspešna razporeditev najdena po {attempts} poskusih!")
    print("\nKončna veriga kart:")
    print(" -> ".join(chain))

    print("\nUstvarjanje sanjskega zemljevida:")
    for i, card in enumerate(chain):
        suit = card[-1]
        print(f"Karta {i + 1} ({card}): Lokacija na sanjskem zemljevidu: {DREAM_LOCATIONS[suit]}")

    suit = chain[0][-1]
    location = DREAM_LOCATIONS[suit].split(" (")[0]
    print(f"\nVaš sanjski zemljevid se začne z lokacijo: {location}")
    print(
        f"Predlog za sanjsko namero: 'Nocoj bom obiskal {location}, "
        "raziskal svoja čustva in vedel, da sanjam.'"
    )

    return chain, attempts


def module_4(chain):
    print("=== Modul 4: Interpretacija in shranjevanje rezultatov ===")

    if not chain:
        print("Najprej dokončajte Modul 3, da ustvarite sanjski zemljevid!")
        return

    print("Interpretacija vašega sanjskega zemljevida:")
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
    filename = f"sanjski_zemljevid_{timestamp}.txt"

    with open(filename, "w", encoding="utf-8") as f:
        f.write("Sanjski zemljevid - Rezultat tečaja kartografije sanj\n")
        f.write(f"Datum: {timestamp}\n")
        f.write(f"Poskusi: {attempts}\n")
        f.write("Veriga kart:\n")
        for i, card in enumerate(chain):
            value = card[:-1]
            suit = card[-1]
            f.write(f"Karta {i + 1}: {card}\n")
            f.write(f" - Simbolika: {SYMBOLS[suit]}\n")
            f.write(f" - Vrednost: {VALUES[value]}\n")
            f.write(f" - Možna sanjska lokacija: {DREAM_LOCATIONS[suit]}\n")
            f.write("\n")

    print(f"Rezultat shranjen v datoteko: {filename}")


def main():
    modul = sys.argv[1] if len(sys.argv) > 1 else "vse"

    chain = None

    if modul in ("1", "vse"):
        module_1()
        print()
    if modul in ("2", "vse"):
        module_2()
        print()
    if modul in ("3", "vse"):
        chain, attempts = module_3()
        print()
    if modul in ("4", "vse"):
        if chain is None:
            # modul 4 samostojno - ustvari verigo sproti, ker CLI klici
            # nimajo skupnega stanja s prejšnjim zagonom
            chain, attempts = play_medici_patience(max_attempts=10000)
        module_4(chain)

    if chain:
        save_result(chain, locals().get("attempts", 0))


if __name__ == "__main__":
    main()

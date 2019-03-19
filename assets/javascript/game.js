// Initial state of all characters that will not change
const charactersInitialState =
{
    "Obi-Wan-Kenobi": {
        name: "Obi-Wan-Kenobi",
        hp: 110,
        "attack-power": 6,
        "counter-attack-power": 6,
        imageUrl: './assets/images/obiwan.jpg'
    },
    "Luke-Skywalker": {
        name: "Luke-Skywalker",
        hp: 100,
        "attack-power": 8,
        "counter-attack-power": 8,
        imageUrl: './assets/images/luke.jpg'
    },
    "Darth-Sidious": {
        name: "Darth-Sidious",
        hp: 115,
        "attack-power": 10,
        "counter-attack-power": 10,
        imageUrl: './assets/images/darth-sidious.jpg'
    },
    "Darth-Maul": {
        name: "Darth-Maul",
        hp: 120,
        "attack-power": 12,
        "counter-attack-power": 12,
        imageUrl: './assets/images/darth-maul.jpg'
    }
};

// Deep copy of character stats to be modified in fight actions
let charactersDeepCopy = {};

// State of the game
const game = {
    state: {
        finished: false,
        win: false,
        loss: false
    },
    selectedCharacter: "",
    selectedDefender: "",
    defeatedCharacters: 0,
    totalCharacters: 0,

    victory() {
        return this.defeatedCharacters === this.totalCharacters - 1;
    },

    fight(selectedCharacter, defender) { // (str, str) -> Null
        const chosenCharacterAttack = charactersDeepCopy[selectedCharacter]["attack-power"];
        charactersDeepCopy[selectedCharacter].hp -= charactersDeepCopy[defender]["counter-attack-power"];
        charactersDeepCopy[defender].hp -= chosenCharacterAttack;
        charactersDeepCopy[selectedCharacter]["attack-power"] += charactersInitialState[selectedCharacter]["attack-power"];
    },
    setGameState(finished, win, loss) {
        this.state.finished = finished;
        this.state.win = win;
        this.state.loss = loss;
    },
    resetGameState() {
        this.selectedCharacter = "";
        this.selectedDefender = "";
        this.setGameState(false, false, false);
        this.totalCharacters = 0;
        this.defeatedCharacters = 0;
    }
}

$(document).ready(function () {

    function bindCharacterClick(box) {
        // Moves character boxes to appropriate row based on game state
        box.click(function () {
            if (!game.selectedCharacter) {
                box.addClass("chosen-character");
                $("#all-characters").children(".character-box").each(function () {
                    if (!$(this).is(box)) {
                        $(this).addClass("enemy")
                        $("#enemies-available").append($(this));
                    }
                });
                game.selectedCharacter = box.attr("name");
            } else if (!game.selectedDefender && game.selectedCharacter) {
                box.addClass("defender");
                $("#defender").append(box);
                game.selectedDefender = box.attr("name");
            }
        })
    }

    function resetGame() {

        // Reset game state
        game.resetGameState();

        // Remove character boxes from all rows
        [$("#all-characters"), $("#enemies-available"), $("#defender"), $("#fight-result")].forEach(jQObj => {
            jQObj.empty();
        });

        // Initialize all-character section with character boxes
        charactersDeepCopy = JSON.parse(JSON.stringify(charactersInitialState));
        Object.values(charactersDeepCopy).forEach(stats => {
            game.totalCharacters++;
            const characterBox = $("<div>");
            const name = $("<div>");
            name.text(stats.name);

            const hp = $("<div>");
            const attack = $("<div>")
            const image = $('<img>')
            image.attr('src', stats.imageUrl)

            hp.text("Health: " + stats["hp"]);
            hp.attr("class", "hp");
            attack.text("Attack: " + stats["attack-power"]);
            attack.attr("class", "attack");

            characterBox
                .addClass("character-box")
                .attr("name", stats.name)
                .attr("id", stats.name)
                .append(name)
                .append(hp)
                .append(attack)
                .append(image)

            bindCharacterClick(characterBox);

            $("#all-characters").append(characterBox);
        });
    }


    // Resets game display and internal game state
    $("#reset-game").click(() => {
        resetGame();
    });

    // Logic and display handling fight button click
    $("#fight-button").click(() => {
        if (game.state.finished) {
            return;
        }
        if (!game.selectedCharacter || !game.selectedDefender) {
            $("#fight-result").text("No enemy here.")
            return;
        }
        const selectedCharacterStr = game.selectedCharacter;
        const defenderStr = game.selectedDefender;
        const selectedCharacter = charactersDeepCopy[selectedCharacterStr];
        const defender = charactersDeepCopy[defenderStr];
        const yourAttack = selectedCharacter["attack-power"];
        const defenderAttack = defender["counter-attack-power"];

        game.fight(selectedCharacterStr, defenderStr);

        if (selectedCharacter.hp <= 0) {
            game.setGameState(true, false, true)
            $("#reset-game");
        }
        if (defender.hp <= 0) {
            $("#defender").empty();
            game.selectedDefender = "";
            game.defeatedCharacters++;
            $("#fight-result").text("You have defeated " + defenderStr + "! Choose another enemy to continue.");

        } else {
            $("#" + defenderStr)
                .children(".hp")
                .text("Health: " + defender.hp);
            $("#fight-result").text("You attacked " + defenderStr + " for " + yourAttack + " damage. "
                + defenderStr + " attacked you for back for " + defenderAttack + " damage.");
        }

        const selectedCharacterObj = $("#" + selectedCharacterStr);
        selectedCharacterObj
            .children(".hp")
            .text("Health: " + selectedCharacter.hp);

        selectedCharacterObj
            .children(".attack")
            .text("Attack: " + selectedCharacter["attack-power"]);

        if (game.state.loss) {
            $("#fight-result").text(defenderStr + " defeated you. GAME OVER! Press restart to try again.");
        }
        else if (game.victory()) {
            game.setGameState(true, true, false)
            $("#fight-result").text("You won! GAME OVER! Press restart to play again.");
        }
    });

    function main() {
        resetGame();
    }

    // Begins game
    main();
});

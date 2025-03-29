document.addEventListener('DOMContentLoaded', function() {
    
    // Funkcja aktualizowania danych na stronie
    function updateData(endpoint, fields) {
        console.log("Endpoint:", endpoint); // Sprawdź, jaki endpoint jest używany
        console.log("Character ID:", localStorage.getItem("logedInCharacterId"));
        console.log("User ID:", localStorage.getItem("userId"));

        const characterId = localStorage.getItem("logedInCharacterId");
        const userId = localStorage.getItem("userId");

        fetch(endpoint, {
            method: 'POST', // Użycie metody POST
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ characterId, userId }) // Dodano userId do przesyłanych danych
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            fields.forEach(({ elementId, valuePath, transform }) => {
                const element = document.getElementById(elementId);
                const value = valuePath.reduce((acc, key) => acc[key], data);
                element.textContent = transform ? transform(value) : value;
            });
        })
        .catch(error => console.error(`Error fetching data from ${endpoint}:`, error));
    }

    function updateCharacterInfo() {
        const fields = [
            {
            elementId: 'classRaceName',
            valuePath: [],
            transform: (character) => {
                const race = character.race === "4" ? "Human" : character.race;
                const className = character.class === "8" ? "Knight" : character.class;
                return `${race} ${className}`;
            }
            },
            {
            elementId: 'characterLvl',
            valuePath: ['lvl'],
            transform: (lvl) => `Level ${lvl}`
            },
            {
            elementId: 'characterName',
            valuePath: ['name']
            },
            {
            elementId: 'experiencePoints',
            valuePath: [],
            transform: (character) => `EXP ${character.currentExperiencePoints}/${character.requiredExperiencePoints}`
            },
            {
            elementId: 'healthPoints',
            valuePath: ['hpAndMp', 'Hp'],
            transform: (hp) => `${hp.currentPoints}/${hp.baseValue + hp.additionalValue}`
            },
            {
            elementId: 'manaPoints',
            valuePath: ['hpAndMp', 'Mana'],
            transform: (mana) => `${mana.currentPoints}/${mana.baseValue + mana.additionalValue}`
            },
            {
            elementId: 'characterSta',
            valuePath: ['attributes', 'Stamina'],
            transform: (stamina) => stamina.baseValue + stamina.additionalValue
            },
            {
            elementId: 'characterStr',
            valuePath: ['attributes', 'Strength'],
            transform: (strength) => strength.baseValue + strength.additionalValue
            },
            {
            elementId: 'characterWis',
            valuePath: ['attributes', 'Wisdom'],
            transform: (wisdom) => wisdom.baseValue + wisdom.additionalValue
            },
            {
            elementId: 'characterInt',
            valuePath: ['attributes', 'Intelligence'],
            transform: (intelligence) => intelligence.baseValue + intelligence.additionalValue
            },
            {
            elementId: 'characterAgi',
            valuePath: ['attributes', 'Agility'],
            transform: (agility) => agility.baseValue + agility.additionalValue
            },
            {
            elementId: 'characterCha',
            valuePath: ['attributes', 'Charisma'],
            transform: (charisma) => charisma.baseValue + charisma.additionalValue
            }
        ];

        updateData('http://127.0.0.1:5000/fetch_character', fields);
    }

    // Wywołanie funkcji aktualizowania danych na stronie
    updateCharacterInfo();
});
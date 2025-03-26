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
                    const race = character.race === 4 ? "Human" : character.race;
                    const className = character.class === 8 ? "Knight" : character.class;
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
                valuePath: ['characteristics'],
                transform: (characteristics) => `EXP ${characteristics['currentExperiencePoints']}/${characteristics['requiredExperiencePoints']}`
            },
            {
                elementId: 'healthPoints',
                valuePath: ['characteristics'],
                transform: (characteristics) => `${characteristics['currentHp']}/${characteristics['totalMaxHp']}`
            },
            {
                elementId: 'manaPoints',
                valuePath: ['characteristics'],
                transform: (characteristics) => `${characteristics['currentMana']}/${characteristics['totalMaxMana']}`
            },
            {
                elementId: 'characterSta',
                valuePath: ['atributes', 'currentStamina']
            },
            {
                elementId: 'characterStr',
                valuePath: ['atributes', 'currentStrength']
            },
            {
                elementId: 'characterWis',
                valuePath: ['atributes', 'currentWisdom']
            },
            {
                elementId: 'characterInt',
                valuePath: ['atributes', 'currentIntelligence']
            },
            {
                elementId: 'characterAgi',
                valuePath: ['atributes', 'currentAgility']
            },
            {
                elementId: 'characterCha',
                valuePath: ['atributes', 'currentCharisma']
            }
        ];

        updateData('http://127.0.0.1:5000/fetch_character', fields);
    }

    // Wywołanie funkcji aktualizowania danych na stronie
    updateCharacterInfo();
});
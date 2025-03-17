document.addEventListener('DOMContentLoaded', function() {
    
    // funkcje aktualizowania danych na stronie

    function updateData(endpoint, fields) {
        fetch(endpoint)
            .then(response => response.json())
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
            elementId: 'characterLvl',
            valuePath: ['lvl'],
            transform: (lvl) => `Level ${lvl}`
            },
            {
            elementId: 'characterName',
            valuePath: ['name']
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

        updateData('http://127.0.0.1:5000/get_character', fields);
    }

    // wywołanie funkcji aktualizowania danych na stronie
    updateCharacterInfo();
});
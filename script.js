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
                elementId: 'characterState',
                valuePath: ['characterState', 'stateId'],
                transform: (stateId) => stateId === 1 ? 'Alive' : 'Dead'
            },
            {
                elementId: 'characterLocalization',
                valuePath: ['characterState', 'localization', 'localizationType'],
                transform: (localizationTypeId) => localizationTypeId === 0 ? 'City' : 'Spawn'
            },
            {
                elementId: 'characterOperationStatus',
                valuePath: ['characterState', 'operationKind'],
                transform: (localizationTypeId) => {
                switch (localizationTypeId) {
                case 0: return 'Idle';
                case 1: return 'Respawning';
                case 2: return 'Travelling';
                case 3: return 'Battle';
                default: return 'Unknown';
                    }   
                }
            }
        ];

        updateData('http://127.0.0.1:5000/get_character', fields);
    }


    function updateSpawnList() {
        fetch('http://127.0.0.1:5000/get_character')
            .then(response => response.json())
            .then(characterData => {
                const characterLevel = characterData['lvl']; // Pobierz poziom postaci
    
                fetch('http://127.0.0.1:5000/get_mob_spawn_dictionary')
                    .then(response => response.json())
                    .then(mobSpawnDictionary => {
                        // Znajdź spawnId na podstawie spawnLevel odpowiadającego characterLevel
                        const spawnEntry = Object.values(mobSpawnDictionary).find(entry => entry.spawnLevel === characterLevel);
    
                        const spawnLvlCenterElement = document.getElementById('spawn_lvl_center');
                        const spawnLvlLeftElement = document.getElementById('spawn_lvl_left');
                        
                        if (spawnEntry) {
                            spawnLvlCenterElement.textContent = `Lvl ${spawnEntry.spawnLevel}`; // Wyświetl spawnLevel
                            
                            // Znajdź wpis dla spawnLevel o jeden mniejszy
                            const previousSpawnEntry = Object.values(mobSpawnDictionary).find(entry => entry.spawnLevel === spawnEntry.spawnLevel - 1);
                            if (previousSpawnEntry) {
                                spawnLvlLeftElement.textContent = `Lvl ${previousSpawnEntry.spawnLevel}`; // Wyświetl poprzedni spawnLevel
                            } else {
                                spawnLvlLeftElement.textContent = 'No previous spawn'; // Jeśli brak dopasowania
                            }
                        } else {
                            spawnLvlCenterElement.textContent = 'No spawn found'; // Jeśli brak dopasowania
                            spawnLvlLeftElement.textContent = 'No previous spawn'; // Jeśli brak dopasowania
                        }
                    })
                    .catch(error => console.error('Error fetching mob spawn dictionary:', error));
            })
            .catch(error => console.error('Error fetching character data:', error));
    }

    // wywołanie funkcji aktualizowania danych na stronie
    updateCharacterInfo();
    
    // Zmienne dla opcji menu
    const menuOptions = document.querySelectorAll('.menu_option_label_container');
    const contentIframe = document.getElementById('contentIframe');
    
        // Zmienne dla sekcji typu moba
    const monsterTypeContainers = document.querySelectorAll('.monster_type_label .monster_type_container');
    const spawnLvlLabel = document.getElementById('spawnLvlLabel');

    // Dodaj nasłuchiwanie na kliknięcia opcji menu
    menuOptions.forEach(option => {
        option.addEventListener('click', handleMenuOptionClick);
    });

    // Funkcja do obsługi kliknięcia opcji menu
    function handleMenuOptionClick() {
        const optionText = this.textContent.trim();
        loadIframeContent(optionText);
    }

    // Funkcja do wyświetlania odpowiedniej zawartości w iframe
    function loadIframeContent(option) {
        let contentUrl = '';
        switch(option) {
            case 'Character':
                contentUrl = 'character.html';
                break;
        } // do dodania kolejne warunki dla innych opcji

        contentIframe.src = contentUrl;
    }


    // Funkcja do wyświetlania etykiety poziomu spawn
    function showSpawnLevelLabel() {
            spawnLvlLabel.style.display = 'flex'; // Displays the section
            updateSpawnList(); // Updates the spawn list
    }

    
    // Dodaj nasłuchiwanie na kliknięcia kontenerów typu potwora
    monsterTypeContainers.forEach(container => {
        container.addEventListener('click', showSpawnLevelLabel);
    });

    // Ukryj sekcję na początku
    spawnLvlLabel.style.display = 'none';

});
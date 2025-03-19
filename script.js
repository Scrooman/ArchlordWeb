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

    let chosedMobType = null;
    let centerSpawnLvl = null;

    // Funkcja do wyświetlania listy spawnów na podstawie typu moba i poziomu postaci
    function showUpdatedSpawnList(mobType, referenceLevel = null) {
        fetch('http://127.0.0.1:5000/get_character')
            .then(response => response.json())
            .then(characterData => {
            const characterLevel = referenceLevel || characterData['lvl']; // Use referenceLevel if provided, otherwise use character level
            const url = `http://127.0.0.1:5000/get_mob_spawn_dictionary?mobType=${mobType}`;
            const chosedMobType = mobType;
            
            fetch(url)
                .then(response => response.json())
                .then(mobSpawnDictionary => {
                const spawnLvlCenterElement = document.getElementById('spawn_lvl_center');
                const spawnLvlLeftElement = document.getElementById('spawn_lvl_left');
                const spawnLvlRightElement = document.getElementById('spawn_lvl_right');
                
                // Reset content in case no spawn is found
                spawnLvlCenterElement.textContent = 'No spawn found';
                spawnLvlLeftElement.textContent = 'No previous spawn';
                spawnLvlRightElement.textContent = 'No next spawn';

                // Extract and display the center spawn level data
                const centerSpawnData = mobSpawnDictionary.centerSpawnLvl;
                if (centerSpawnData) {
                    const spawnEntry = Object.values(centerSpawnData)[0]; // Assuming there's only one entry
                    if (spawnEntry) {
                    spawnLvlCenterElement.textContent = `Lvl ${spawnEntry.spawnLevel}`;
                    centerSpawnLvl = Object.values(centerSpawnData)[0].spawnLevel; // nadpisanie zmiennej centerSpawnLvl
                    }
                }

                // Extract and display the left spawn level data
                const leftSpawnData = mobSpawnDictionary.leftSpawnLvl;
                if (leftSpawnData) {
                    const spawnEntry = Object.values(leftSpawnData)[0]; // Assuming there's only one entry
                    if (spawnEntry) {
                    spawnLvlLeftElement.textContent = `Lvl ${spawnEntry.spawnLevel}`;
                    }
                }

                // Extract and display the right spawn level data
                const rightSpawnData = mobSpawnDictionary.rightSpawnLvl;
                if (rightSpawnData) {
                    const spawnEntry = Object.values(rightSpawnData)[0]; // Assuming there's only one entry
                    if (spawnEntry) {
                    spawnLvlRightElement.textContent = `Lvl ${spawnEntry.spawnLevel}`;
                    }
                }
                })
                .catch(error => console.error('Error fetching mob spawn dictionary:', error));
            })
            .catch(error => console.error('Error fetching character data:', error));
    }


    // Funkcja do zmiany wyświetlnej listy spawnów na podstawie typu moba i kierunku zmiany
    function showAnotherSpawnOnSpawnList(mobType, direction) {
        fetch('http://127.0.0.1:5000/get_character')
            .then(response => response.json())
            .then(characterData => {
            const url = `http://127.0.0.1:5000/get_another_mob_spawn_dictionary?mobType=${mobType}&lvlChange=${direction}&currentCenterSpawnLvl=${centerSpawnLvl}`;
            
            fetch(url)
                .then(response => response.json())
                .then(mobSpawnDictionary => {
                const spawnLvlCenterElement = document.getElementById('spawn_lvl_center');
                const spawnLvlLeftElement = document.getElementById('spawn_lvl_left');
                const spawnLvlRightElement = document.getElementById('spawn_lvl_right');
                
                // Reset content in case no spawn is found
                spawnLvlCenterElement.textContent = 'No spawn found';
                spawnLvlLeftElement.textContent = 'No previous spawn';
                spawnLvlRightElement.textContent = 'No next spawn';

                // Extract and display the center spawn level data
                const centerSpawnData = mobSpawnDictionary.centerSpawnLvl;
                if (centerSpawnData) {
                    const spawnEntry = Object.values(centerSpawnData)[0]; // Assuming there's only one entry
                    if (spawnEntry) {
                        const newSpawnLevel = `Lvl ${spawnEntry.spawnLevel}`;
                        if (spawnLvlCenterElement.textContent !== newSpawnLevel) {
                            spawnLvlCenterElement.textContent = newSpawnLevel;
                        }
                    }
                }

                // Extract and display the left spawn level data
                const leftSpawnData = mobSpawnDictionary.leftSpawnLvl;
                if (leftSpawnData) {
                    const spawnEntry = Object.values(leftSpawnData)[0]; // Assuming there's only one entry
                    if (spawnEntry) {
                    spawnLvlLeftElement.textContent = `Lvl ${spawnEntry.spawnLevel}`;
                    }
                }

                // Extract and display the right spawn level data
                const rightSpawnData = mobSpawnDictionary.rightSpawnLvl;
                if (rightSpawnData) {
                    const spawnEntry = Object.values(rightSpawnData)[0]; // Assuming there's only one entry
                    if (spawnEntry) {
                    spawnLvlRightElement.textContent = `Lvl ${spawnEntry.spawnLevel}`;
                    }
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

        // Zmienne dla sekcji poziomu spawn
    const spawnLvlChangeButtonLower = document.getElementById('spawn_lvl_change_button_left');
    const spawnLvlChangeButtonHigher = document.getElementById('spawn_lvl_change_button_right');


    // Funkcja do obsługi kliknięcia opcji menu
    function handleMenuOptionClick() {
        const optionText = this.textContent.trim();
        loadIframeContent(optionText);
    }

    // Dodaj nasłuchiwanie na kliknięcia opcji menu 
    menuOptions.forEach(option => {
        option.addEventListener('click', handleMenuOptionClick);
    });


    // Funkcja do wyświetlania odpowiedniej zawartości w iframe
    function loadIframeContent(option) {
        let contentUrl = '';
        switch(option) {
            case 'Character':
                contentUrl = 'character.html';
                break;
        } // do dodania kolejne warunki dla innych opcji

        if (contentIframe.src.includes(contentUrl)) {
            contentIframe.src = ''; // Reset iframe source
            setTimeout(() => {
                contentIframe.src = contentUrl; // Reload iframe content
            }, 50);
        } else {
            contentIframe.src = contentUrl;
        }
    }

    // Funkcja do wyświetlania etykiety poziomu spawn
    function showSpawnLevelLabel(event) {
        const clickedElement = event.currentTarget;
        const mobType = clickedElement.id.split('_').pop(); 
        
        if (spawnLvlLabel.style.display === 'flex') {
            spawnLvlLabel.style.display = 'none'; 
            setTimeout(() => {
                spawnLvlLabel.style.display = 'flex'; 
                showUpdatedSpawnList(mobType); 
            }, 100); 
        } else {
            spawnLvlLabel.style.display = 'flex'; 
            showUpdatedSpawnList(mobType);
        }
    }

    // Dodaj nasłuchiwanie na kliknięcia kontenerów typu potwora
    monsterTypeContainers.forEach(container => {
        container.addEventListener('click', showSpawnLevelLabel);
    });

    // Ukryj sekcję na początku
    spawnLvlLabel.style.display = 'none';

    function showLowerLvlSpawn() {
        showAnotherSpawnOnSpawnList(chosedMobType, "lower");
    }

    spawnLvlChangeButtonLower.addEventListener('click', showLowerLvlSpawn);

    function showHigherLvlSpawn() {
        showAnotherSpawnOnSpawnList(chosedMobType, "higher");
    }

    spawnLvlChangeButtonHigher.addEventListener('click', showHigherLvlSpawn);



});
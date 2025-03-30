document.addEventListener('DOMContentLoaded', function() {
    const characterId = parseInt(localStorage.getItem("logedInCharacterId"), 10);
    // Sprawdzenie, czy użytkownik jest zalogowany
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
        alert("You must log in first!");
        window.location.href = "login.html";
    }

    document.getElementById("logoutButton").addEventListener("click", () => {
        // Usuń dane logowania z localStorage
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userId");
        localStorage.removeItem("logedInCharacterId");

        // Przekieruj na login.html
        window.location.href = "login.html";
    });
    
    // funkcje aktualizowania danych na stronie

    function updateData(endpoint, fields) {
        
        const userId = localStorage.getItem("userId");    

        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ characterId, userId })
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
                elementId: 'characterState',
                valuePath: ['characterState', 'stateId'],
                transform: (stateId) => stateId === 1 ? 'Dead' : 'Alive'
            },
            {
                elementId: 'characterLocalization',
                valuePath: ['localizationTypeId'],
                transform: (localizationTypeId) => localizationTypeId === 0 ? 'City' : 'Spawn'
            },
            {
                elementId: 'characterOperationStatus',
                valuePath: ['characterOperation', 'operationKindId'],
                transform: (localizationTypeId) => {
                switch (localizationTypeId) {
                case 1: return 'Battle';
                case 2: return 'Idle';
                case 3: return 'Travelling';
                case 4: return 'Waiting for mob to respawn';
                case 5: return 'Respawning';
                default: return 'Unknown';
                    }   
                }
            }
        ];

        updateData('http://127.0.0.1:5000/fetch_character', fields);
    }
    const logedInCharacterId = parseInt(localStorage.getItem("logedInCharacterId"), 10); // pobranie id postaci z local storage do pracy na stronie

    if (logedInCharacterId) {
        updateCharacterInfo(logedInCharacterId);
    } else {
        console.error("Character ID not found.");
    }

    let chosedMobType = null;
    let currentCenterSpawnLvl = null;
    centerSpawnLevel = null;
    leftSpawnLevel = null;
    rightSpawnLevel = null;

    // Funkcja do wyświetlania listy spawnów na podstawie typu moba i poziomu postaci
    function showUpdatedSpawnList(mobType, referenceLevel = null) {
        const characterId = parseInt(localStorage.getItem("logedInCharacterId"), 10);
        const userId = parseInt(localStorage.getItem("userId"), 10);

        fetch('http://127.0.0.1:5000/fetch_character', {
            method: 'POST', // Użycie metody POST
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({ characterId, userId }) 
        })
        .then(response => {
            if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(characterData => {
            const characterLevel = referenceLevel || characterData['lvl']; // Use referenceLevel if provided, otherwise use character level
            const requiredLvl = characterData['lvl']; // Extract the required level from the response
            const url = `http://127.0.0.1:5000/get_mob_spawn_dictionary?mobType=${mobType}&requiredLvl=${requiredLvl}`;
            chosedMobType = mobType; // Update global variable
                
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
                                currentCenterSpawnLvl = spawnEntry.spawnLevel; // Update global variable
                                centerSpawnLevel = spawnEntry.spawnLevel; // Store the spawnId for rightSpawnLvl
                            }
                        }

                        // Extract and display the left spawn level data
                        const leftSpawnData = mobSpawnDictionary.leftSpawnLvl;
                        if (leftSpawnData) {
                            const spawnEntry = Object.values(leftSpawnData)[0]; // Assuming there's only one entry
                            if (spawnEntry) {
                                spawnLvlLeftElement.textContent = `Lvl ${spawnEntry.spawnLevel}`;
                                leftSpawnLevel = spawnEntry.spawnLevel; // Store the spawnId for rightSpawnLvl
                            }
                        }

                        // Extract and display the right spawn level data
                        const rightSpawnData = mobSpawnDictionary.rightSpawnLvl;
                        if (rightSpawnData) {
                            const spawnEntry = Object.values(rightSpawnData)[0]; // Assuming there's only one entry
                            if (spawnEntry) {
                                spawnLvlRightElement.textContent = `Lvl ${spawnEntry.spawnLevel}`;
                                rightSpawnLevel = spawnEntry.spawnLevel; // Store the spawnId for rightSpawnLvl
                            }
                        }
                    })
                    .catch(error => console.error('Error fetching mob spawn dictionary:', error));
            })
            .catch(error => console.error('Error fetching character data:', error));
    }


    // Funkcja do zmiany wyświetlnej listy spawnów na podstawie typu moba i kierunku zmiany
    function showAnotherSpawnOnSpawnList(mobType, direction) {
        const url = `http://127.0.0.1:5000/get_another_mob_spawn_dictionary?mobType=${mobType}&lvlChange=${direction}&currentCenterSpawnLvl=${currentCenterSpawnLvl}`;
        
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

                console.log('Current Center Spawn Level:', currentCenterSpawnLvl);
                // Extract and display the center spawn level data
                const centerSpawnData = mobSpawnDictionary.centerSpawnLvl;
                if (centerSpawnData) {
                    const spawnEntry = Object.values(centerSpawnData)[0]; // Assuming there's only one entry
                    if (spawnEntry) {
                        spawnLvlCenterElement.textContent = `Lvl ${spawnEntry.spawnLevel}`;
                        currentCenterSpawnLvl = spawnEntry.spawnLevel; // Update global variable
                        centerSpawnLevel = spawnEntry.spawnLevel; // Store the spawnId for rightSpawnLvl
                    }
                }

                // Extract and display the left spawn level data
                const leftSpawnData = mobSpawnDictionary.leftSpawnLvl;
                if (leftSpawnData) {
                    const spawnEntry = Object.values(leftSpawnData)[0]; // Assuming there's only one entry
                    if (spawnEntry) {
                        spawnLvlLeftElement.textContent = `Lvl ${spawnEntry.spawnLevel}`;
                        leftSpawnLevel = spawnEntry.spawnLevel; // Store the spawnId for rightSpawnLvl
                    }
                }

                // Extract and display the right spawn level data
                const rightSpawnData = mobSpawnDictionary.rightSpawnLvl;
                if (rightSpawnData) {
                    const spawnEntry = Object.values(rightSpawnData)[0]; // Assuming there's only one entry
                    if (spawnEntry) {
                        spawnLvlRightElement.textContent = `Lvl ${spawnEntry.spawnLevel}`;
                        rightSpawnLevel = spawnEntry.spawnLevel; // Store the spawnId for rightSpawnLvl
                    }
                }
            })
            .catch(error => console.error('Error fetching mob spawn dictionary:', error));
    }
    
    // Zmienne dla opcji menu
    const menuOptions = document.querySelectorAll('.menu_option_label_container');
    let activeMenuOption = null;

    menuOptions.forEach(option => {
        option.addEventListener('click', function () {
            // Remove highlight from the previously active option
            if (activeMenuOption) {
                activeMenuOption.style.background = '';
            }

            // Highlight the currently clicked option
            this.style.background = "linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1)), url('images/button.png')";
            this.style.backgroundSize = "100% 100%";
            this.style.backgroundBlendMode = "lighten";

            // Update the activeMenuOption reference
            activeMenuOption = this;
        });
    });
    const contentIframe = document.getElementById('contentIframe');
    
        // Zmienne dla sekcji typu moba
    const monsterTypeContainers = document.querySelectorAll('.monster_type_label .monster_type_container');
    const spawnLvlLabel = document.getElementById('spawnLvlLabel');

        // Zmienne dla sekcji poziomu spawn
    const spawnLvlChangeButtonContainers = document.querySelectorAll('.spawn_lvl_container');
    const spawnLvlChangeButtonLower = document.getElementById('spawn_lvl_change_button_left');
    const spawnLvlChangeButtonHigher = document.getElementById('spawn_lvl_change_button_right');
    const spawnLvlChangeButtonCenter = document.getElementById('spawn_lvl_change_button_center');
    const spawnLvlOptions = document.querySelectorAll('.spawn_lvl_container.spawn_lvl');


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

    // Ukryj sekcję ze spawnLvl na początku
    spawnLvlLabel.style.display = 'none';


    //pobierz mniejsze poziomy spawnów
    function showLowerLvlSpawn() {
        showAnotherSpawnOnSpawnList(chosedMobType, "lower");
    }

    spawnLvlChangeButtonLower.addEventListener('click', showLowerLvlSpawn);


    // pobierz wyższy poziom spawnów
    function showHigherLvlSpawn() {
        showAnotherSpawnOnSpawnList(chosedMobType, "higher");
    }

    spawnLvlChangeButtonHigher.addEventListener('click', showHigherLvlSpawn);

    function activateSpawnForSpawnLvl(chosedSpawnLvlButtonName, mobType) {
        let mobSpawnLevel;
        switch (chosedSpawnLvlButtonName) {
            case 'center':
                mobSpawnLevel = centerSpawnLevel;
                break;
            case 'left':
                mobSpawnLevel = leftSpawnLevel;
                break;
            case 'right':
                mobSpawnLevel = rightSpawnLevel;
                break;
            default:
                console.error('Invalid spawn level button name:', chosedSpawnLvlButtonName);
                return;
        }
        if (!mobSpawnLevel) {
            console.error('No spawn level selected to activate.');
            return;
        }
        console.log('Activating spawn level:', mobSpawnLevel, 'for mob type:', mobType); // Added mobType to the log
        const characterId = parseInt(localStorage.getItem("logedInCharacterId"), 10);
        const url = `http://127.0.0.1:5000/set_active_spawn_for_spawn_lvl`;
        const payload = { spawnLevel: mobSpawnLevel, mobType: mobType , characterId: characterId}; // Added mobType to the payload

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Spawn level activated successfully:', data);
                if (data && data.mobData && data.mobData.mobId) {
                    loadIframeContentMobBattle(data.mobData.mobId);
                } else {
                    console.error('No mobId found in the response.');
                }
            })
            .catch(error => console.error('Error activating spawn level:', error));
    }

    // funkcja do wyboru i aktywowania spawnu
    function selectSpawnLvl(event) {
        const clickedElement = event.currentTarget;
        const chosedSpawnLvlButton = clickedElement.id.split('_').pop(); // Extract the last word after "_" from the ID
        activateSpawnForSpawnLvl(chosedSpawnLvlButton, chosedMobType);
    }

    spawnLvlChangeButtonContainers.forEach(container => {
        container.addEventListener('click', selectSpawnLvl);
    });


// Dodaj nasłuchiwanie na kliknięcia opcji menu - do poprawy

spawnLvlOptions.forEach(option => {
    option.addEventListener('click', loadIframeContentMobBattle);
});


// Funkcja do wyświetlania odpowiedniej zawartości w iframe
function loadIframeContentMobBattle(mobId) {
    const contentUrl = `mob_battle.html?mobId=${mobId}`; // Pass mobId as a query parameter

    if (contentIframeMobBattle.src.includes(contentUrl)) {
        contentIframeMobBattle.src = ''; // Reset iframe source
        setTimeout(() => {
            contentIframeMobBattle.src = contentUrl; // Reload iframe content
        }, 50);
    } else {
        contentIframeMobBattle.src = contentUrl;
    }
}

});
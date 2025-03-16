document.addEventListener('DOMContentLoaded', function() {
    
    // funkcje aktualizowania danych na stronie

    function updateData(endpoint, elementId, callback) {
        fetch(endpoint)
            .then(response => response.json())
            .then(data => {
                const element = document.getElementById(elementId);
                callback(data, element);
            })
            .catch(error => console.error(`Error fetching data from ${endpoint}:`, error));
    }

    function updateCharacterInfo() {
        updateData('http://127.0.0.1:5000/get_character', 'characterState', (data, element) => {
            const stateId = data["characterState"]["stateId"];
            element.textContent = stateId === 1 ? 'Alive' : 'Dead';
        });

        updateData('http://127.0.0.1:5000/get_character', 'characterLocalization', (data, element) => {
            const localization = data["characterState"]["localization"]["localizationType"];
            element.textContent = stateId === 1 ? 'City' : 'Spawn';
        });
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
    }

    
    // Dodaj nasłuchiwanie na kliknięcia kontenerów typu potwora
    monsterTypeContainers.forEach(container => {
        container.addEventListener('click', showSpawnLevelLabel);
    });

    // Ukryj sekcję na początku
    spawnLvlLabel.style.display = 'none';

});
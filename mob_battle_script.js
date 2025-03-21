document.addEventListener('DOMContentLoaded', function() {
    
    // funkcje aktualizowania danych na stronie

    function updateMobData(endpoint, fields) {
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

    function updateMobInfo() {
        const mobId = new URLSearchParams(window.location.search).get('mobId');
        // pola do aktualizacji na stronie
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
            }
        ];
        const url = `http://127.0.0.1:5000/get_mob_data?mobId=${mobId}`;
        updateMobData(url, fields);
    }

    // wywołanie funkcji aktualizowania danych na stronie
    updateMobInfo();
});
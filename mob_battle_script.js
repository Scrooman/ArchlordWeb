document.addEventListener('DOMContentLoaded', function() {
    
    // funkcje aktualizowania danych na stronie

    function updateMobData(fields) {
        const mobId = new URLSearchParams(window.location.search).get('mobId');
        const endpoint = `http://127.0.0.1:5000/get_mob_data?mobId=${mobId}`;
        fetch(endpoint)
            .then(response => response.json())
            .then(data => {
                console.log('Response data:', data); // Logowanie odpowiedzi
                fields.forEach(({ elementId, valuePath, transform }) => {
                    const element = document.getElementById(elementId);
                    const value = valuePath.reduce((acc, key) => acc ? acc[key] : null, data); // Bezpieczne odczytywanie
                    if (value === null) {
                        console.error(`Error: Key path ${valuePath.join('.')} not found in data`);
                    } else {
                        element.textContent = transform ? transform(value) : value;
                    }
                });
            })
            .catch(error => console.error(`Error fetching data from ${endpoint}:`, error));
    }

    function updateMobInfo() {
        // pola do aktualizacji na stronie
        const fields = [
            {
            elementId: 'mobHpLabel',
            valuePath: ['mobHP'],
            }
        ];
        updateMobData(fields);
    }

    // wywołanie funkcji aktualizowania danych na stronie
    updateMobInfo();
});
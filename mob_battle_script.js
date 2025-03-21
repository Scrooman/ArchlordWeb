document.addEventListener('DOMContentLoaded', function () {
    // Function to update data on the page
    function updateMobData(fields) {
        const mobId = new URLSearchParams(window.location.search).get('mobId');
        if (!mobId) {
            console.error('Error: mobId is missing in the URL.');
            return;
        }

        const endpoint = `http://127.0.0.1:5000/get_mob_data?mobId=${mobId}`;
        fetch(endpoint)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Response data:', data); // Log response data
                fields.forEach(({ elementId, valuePath, transform }) => {
                    const element = document.getElementById(elementId);
                    if (!element) {
                        console.error(`Error: Element with ID "${elementId}" not found.`);
                        return;
                    }

                    const value = valuePath.reduce((acc, key) => (acc ? acc[key] : null), data); // Safe value extraction
                    if (value === null) {
                        console.error(`Error: Key path "${valuePath.join('.')}" not found in data.`);
                    } else {
                        element.textContent = transform ? transform(value) : value;
                    }
                });
            })
            .catch(error => console.error(`Error fetching data from ${endpoint}:`, error));
    }

    function updateMobInfo() {
        // Fields to update on the page
        const fields = [
            {
                elementId: 'mobHpLabel',
                valuePath: ['mobHP'],
            },
        ];
        updateMobData(fields);
    }

    // Call the function to update data on the page
    updateMobInfo();
});
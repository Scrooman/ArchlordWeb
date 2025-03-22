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
                const imgContainer = document.querySelector('.mob_img_container');
                if (imgContainer) {
                    const imagePath = data.mobImageSource;
                    if (imagePath) {
                        // Clear existing content in the container
                        imgContainer.innerHTML = '';
                        
                        // Create a new <img> element
                        const imgElement = document.createElement('img');
                        imgElement.src = imagePath;
                        imgElement.alt = "Mob Image"; // Set the alt attribute
                        
                        // Append the <img> element to the container
                        imgContainer.appendChild(imgElement);
                    } else {
                        console.error('Error: mobImageSource is missing in data.');
                    }
                } else {
                    console.error('Error: Element with class "mob_img_container" not found.');
                }
            })
            .catch(error => console.error(`Error fetching data from ${endpoint}:`, error));
    }

    function updateMobInfo() {
        // Fields to update on the page
        const fields = [
            {
            elementId: 'mob_life_bar_name_and_lvl_label',
            valuePath: ['name'],            
        },
            {
            elementId: 'mobHpLabel',
            valuePath: ['mobHP']
            },
            {
            elementId: 'mobTypeLabel',
            valuePath: ['mobTypeId'],
            transform: (value) => {
                switch (value) {
                case 1: return 'Normal';
                case 2: return 'Normal Boss';
                case 3: return 'Unique Boss';
                case 4: return 'Elemental';
                case 5: return 'Battleground Human';
                case 6: return 'Battleground Orc';
                case 7: return 'Battleground Moonelf';
                case 8: return 'Battleground Dragonscion';
                case 9: return "Heaven's Hell";
                default: return 'Unknown';
                }
            }
            },
            ...['Fire', 'Water', 'Earth', 'Air', 'Magic', 'Light', 'Poison', 'Ice'].map(element => ({
            elementId: `mob_ele_damage_value_${element.toLowerCase()}`,
            valuePath: [`mobElementalDamage${element}`],
            transform: (value) => value === '1' ? 'X' : value === '0' ? '' : value
            })),
            ...['Fire', 'Water', 'Earth', 'Air', 'Magic', 'Light', 'Poison', 'Ice'].map(element => ({
            elementId: `mob_ele_resis_value_${element.toLowerCase()}`,
            valuePath: [`mobElementalResistance${element}`],
            transform: (value) => `${value}%`
            }))
        ];
        updateMobData(fields);
    }

    // Call the function to update data on the page
    updateMobInfo();

});
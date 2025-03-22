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
            {
            elementId: 'mobTypeLabel',
            valuePath: ['mobTypeId'],
            transform: (value) => {
            if (value === 1) return 'Normal';
            if (value === 2) return 'Normal Boss';
            if (value === 3) return 'Unique Boss';
            if (value === 4) return 'Elemental';
            if (value === 5) return 'Battleground Human';
            if (value === 6) return 'Battleground Orc';
            if (value === 7) return 'Battleground Moonelf';
            if (value === 8) return 'Battleground Dragonscion';
            if (value === 9) return "Heaven's Hell";
            return 'Unknown'; // Default case
            },
            },
            {
            elementId: 'mob_ele_damage_value_fire',
            valuePath: ['mobElementalDamageFire'], 
            transform: (value) => value === '1' ? 'X' : value === '0' ? '' : value
            },
            {
            elementId: 'mob_ele_damage_value_water',
            valuePath: ['mobElementalDamageWater'], 
            transform: (value) => value === '1' ? 'X' : value === '0' ? '' : value
            },
            {
            elementId: 'mob_ele_damage_value_earth',
            valuePath: ['mobElementalDamageEarth'], 
            transform: (value) => value === '1' ? 'X' : value === '0' ? '' : value
            },
            {
            elementId: 'mob_ele_damage_value_air',
            valuePath: ['mobElementalDamageAir'], 
            transform: (value) => value === '1' ? 'X' : value === '0' ? '' : value
            },
            {
            elementId: 'mob_ele_damage_value_magic',
            valuePath: ['mobElementalDamageMagic'], 
            transform: (value) => value === '1' ? 'X' : value === '0' ? '' : value
            },
            {
            elementId: 'mob_ele_damage_value_light',
            valuePath: ['mobElementalDamageLight'], 
            transform: (value) => value === '1' ? 'X' : value === '0' ? '' : value
            },
            {
            elementId: 'mob_ele_damage_value_poison',
            valuePath: ['mobElementalDamagePoison'], 
            transform: (value) => value === '1' ? 'X' : value === '0' ? '' : value
            },
            {
            elementId: 'mob_ele_damage_value_ice',
            valuePath: ['mobElementalDamageIce'], 
            transform: (value) => value === '1' ? 'X' : value === '0' ? '' : value
            },
            {
            elementId: 'mob_ele_resis_value_fire',
            valuePath: ['mobElementalResistanceFire'], 
            transform: (value) => `${value}%`
            },
            {
            elementId: 'mob_ele_resis_value_water',
            valuePath: ['mobElementalResistanceWater'], 
            transform: (value) => `${value}%`
            },
            {
            elementId: 'mob_ele_resis_value_earth',
            valuePath: ['mobElementalResistanceEarth'], 
            transform: (value) => `${value}%`
            },
            {
            elementId: 'mob_ele_resis_value_air',
            valuePath: ['mobElementalResistanceAir'], 
            transform: (value) => `${value}%`
            },
            {
            elementId: 'mob_ele_resis_value_magic',
            valuePath: ['mobElementalResistanceMagic'], 
            transform: (value) => `${value}%`
            },
            {
            elementId: 'mob_ele_resis_value_light',
            valuePath: ['mobElementalResistanceLight'], 
            transform: (value) => `${value}%`
            },
            {
            elementId: 'mob_ele_resis_value_poison',
            valuePath: ['mobElementalResistancePoison'], 
            transform: (value) => `${value}%`
            },
            {
            elementId: 'mob_ele_resis_value_ice',
            valuePath: ['mobElementalResistanceIce'], 
            transform: (value) => `${value}%`
            },
            {
            elementId: 'mob_img_container',
            valuePath: ['mobImageSource'],
            transform: (value) => {
                const container = document.querySelector('.mob_img_container');
                if (container) {
                container.innerHTML = `<img src="${value}" alt="Mob Image">`;
                }
                return null; // No text content to set
            }
            },
        ];
        updateMobData(fields);
    }

    // Call the function to update data on the page
    updateMobInfo();
});
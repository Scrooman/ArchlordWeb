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
                console.log('Operation status:', localStorage.getItem('characterOperationKindId')); // Log operation status
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

                const mapContainer = document.querySelector('.travelling_destination_map_container');
                if (mapContainer) {
                    const mapImagePath = data.mobLocalizationOnMiniMapSource;
                    if (mapImagePath) {
                        // Clear existing content in the container
                        mapContainer.innerHTML = '';
                        
                        // Create a new <img> element
                        const mapImgElement = document.createElement('img');
                        mapImgElement.src = mapImagePath;
                        mapImgElement.alt = "Mob Localization Map"; // Set the alt attribute
                        
                        // Append the <img> element to the container
                        mapContainer.appendChild(mapImgElement);
                    } else {
                        console.error('Error: mobLocalizationOnMiniMapSource is missing in data.');
                    }
                } else {
                    console.error('Error: Element with class "travelling_destination_map_container" not found.');
                }

                const timeContainer = document.querySelector('.travelling_time_container');
                if (timeContainer) {
                    const endTime = new Date(Date.now() + 5 * 60 * 1000); // Current time + 5 minutes

                    function updateTimer() {
                        const now = new Date();
                        const timeLeft = Math.max(0, endTime - now); // Ensure non-negative value
                        const minutes = Math.floor(timeLeft / 1000 / 60);
                        const seconds = Math.floor((timeLeft / 1000) % 60);
                        timeContainer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

                        if (timeLeft > 0) {
                            setTimeout(updateTimer, 1000); // Update every second
                        }
                    }

                    updateTimer(); // Start the timer
                } else {
                    console.error('Error: Element with class "travelling_time_container" not found.');
                }
            })
            .catch(error => console.error(`Error fetching data from ${endpoint}:`, error));
    }

    // Function to toggle visibility of the section based on localStorage value
    function toggleMobInfoSection() {
        const fadeOutSection = document.querySelector('.mob_info_column_container_fade_out');
        const containerSection = document.querySelector('.mob_info_column_container');
        const eleInfoSection = document.querySelector('.mob_ele_info_container');
        const materialInfoSection = document.querySelector('.mob_material_info_container');
        const accessoriesInfoSection = document.querySelector('.mob_accessories_info_container');
        const operationKindId = localStorage.getItem('characterOperationKindId');

        if (fadeOutSection) {
            fadeOutSection.style.display = operationKindId === '3' ? '' : 'none'; // Toggle fade-out section
        } else {
            console.error('Error: Element with class "mob_info_column_container_fade_out" not found.');
        }

        if (containerSection) {
            containerSection.style.display = operationKindId === '3' ? 'none' : ''; // Toggle container section
        } else {
            console.error('Error: Element with class "mob_info_column_container" not found.');
        }

        if (eleInfoSection) {
            eleInfoSection.style.display = operationKindId !== '3' ? '' : 'none'; // Show if operationKindId is not 3
        } else {
            console.error('Error: Element with class "mob_ele_info_container" not found.');
        }

        if (materialInfoSection) {
            materialInfoSection.style.display = operationKindId !== '3' ? '' : 'none'; // Show if operationKindId is not 3
        } else {
            console.error('Error: Element with class "mob_material_info_container" not found.');
        }

        if (accessoriesInfoSection) {
            accessoriesInfoSection.style.display = operationKindId !== '3' ? '' : 'none'; // Show if operationKindId is not 3
        } else {
            console.error('Error: Element with class "mob_accessories_info_container" not found.');
        }
    }

    // Call the function to toggle visibility on page load
    toggleMobInfoSection();

    function updateMobInfo() {
        // Fields to update on the page
        const fields = [
            {
            elementId: 'mob_life_bar_name_and_lvl_label',
            valuePath: [],
            transform: (value) => `${value['name']} Lvl ${value['lvl']}`
            },
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
            }
        ];
        updateMobData(fields);
    }

    // Call the function to update data on the page
    updateMobInfo();

});
document.addEventListener('DOMContentLoaded', function () {

    // Inicjalizacja WebSocket
    const socket = io('http://127.0.0.1:5000'); // Adres serwera WebSocket

    // Pobierz character_id z localStorage
    const characterId = parseInt(localStorage.getItem("logedInCharacterId"), 10);
    if (characterId) {
        // Dołącz do pokoju dla character_id
        socket.emit('join', { character_id: characterId });

        // Odbieranie aktualizacji walki
        socket.on('fight_update', (data) => {
            console.log('Fight update:', data);
            updateFightUI(data); // Aktualizuj UI
        });

        // Obsługa opuszczenia pokoju
        window.addEventListener('beforeunload', () => {
            socket.emit('leave', { character_id: characterId });
        });
    } else {
        console.error('Error: character_id is missing.');
    }

    // Funkcja do aktualizacji UI na podstawie danych walki
    function updateFightUI(data) { // ta konkretka funkcja jest testowa i zostanie w przyszłości usunięta
        const mobHpLabel = document.getElementById('mobHpLabel');
        if (mobHpLabel && data.mob_hp !== undefined) {
            mobHpLabel.textContent = data.mob_hp;
        }

        // Display damage_to_mob value in the mob_img_and_minimap_container
        const mobImgAndMinimapContainer = document.querySelector('.mob_img_and_minimap_container');
        if (mobImgAndMinimapContainer && data.damage_to_mob !== undefined) {
            const damageElement = document.createElement('div');
            damageElement.textContent = data.damage_to_mob;
            damageElement.style.position = 'absolute';
            damageElement.style.color = 'white';
            damageElement.style.fontSize = '30px';
            damageElement.style.fontWeight = 'bold';
            damageElement.style.pointerEvents = 'none';
            damageElement.style.left = '50%';
            damageElement.style.bottom = '0'; // Start at the bottom of the container
            damageElement.style.transform = 'translateX(-50%)';
            damageElement.style.animation = 'fadeOutAndMoveWithinContainer 2s forwards';

            // Add animation keyframes for fade-out and vertical movement effect within the container
            const styleElement = document.createElement('style');
            styleElement.textContent = `
            @keyframes fadeOutAndMoveWithinContainer {
            0% {
                opacity: 1;
                bottom: 0;
            }
            100% {
                opacity: 0;
                bottom: 100%;
            }
            }
            `;
            document.head.appendChild(styleElement);

            mobImgAndMinimapContainer.appendChild(damageElement);
            console.log('Displayed damage_to_mob:', data.damage_to_mob); // Log display

            // Remove the element after 2 seconds
            setTimeout(() => {
            mobImgAndMinimapContainer.removeChild(damageElement);
            console.log('Removed damage element from mobImgAndMinimapContainer'); // Log removal
            }, 2000);
        }
    }


    // Function to update data on the page
    function updateMobData(fields) {
        let mobId = new URLSearchParams(window.location.search).get('mobId');
        if (!mobId) {
            mobId = localStorage.getItem('characterActiveSpawnMobId');
            console.log('mobId from localStorage:', mobId); // Log mobId from localStorage
            if (!mobId) {
                console.error('Error: mobId is missing in the URL and localStorage.');
                return;
            }
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

                const imgContainer = document.querySelector('#mob_img_container');
                const endTimeString = localStorage.getItem('characterOperationEndDate');
                const startTimeString = localStorage.getItem('characterOperationStartDate');
                const operationKindId = localStorage.getItem('characterOperationKindId');
                if (imgContainer) {
                    const imagePath = data.mobImageSource;
                    if (imagePath) {
                        imgContainer.innerHTML = ''; // Clear existing content
                        const imgElement = document.createElement('img');
                        imgElement.src = imagePath;
                        imgElement.alt = "Mob Image";
                        const styleElement = document.createElement('style');
                        styleElement.textContent = `
                            #mob_img_container::before {
                                content: unset;
                            }
                        `;
                        document.head.appendChild(styleElement);

                        if (operationKindId === '4') {
                            const overlayText = document.createElement('div');
                            overlayText.classList.add('overlay-text');
                            overlayText.textContent = "Mob respawning:"; // Initial text
                            imgContainer.appendChild(overlayText);

                            imgElement.onload = () => {
                                if (startTimeString && endTimeString) {
                                    animateImageReveal('mob_img_container', startTimeString, endTimeString);
                                } else {
                                    console.error('Error: startTimeString or endTimeString is missing in localStorage.');
                                }
                            };

                            // Ensure #mob_img_container::before has content set to ''
                            const styleElementBefore = document.createElement('style');
                            styleElementBefore.textContent = `
                                #mob_img_container::before {
                                    content: '';
                                }
                            `;
                            document.head.appendChild(styleElementBefore);
                        }

                        imgContainer.appendChild(imgElement);
                    } else {
                        console.error('Error: mobImageSource is missing in data.');
                    }
                } else {
                    console.error('Error: Element with ID "mob_img_container" not found.');
                }

                const timeContainer = document.querySelector('.travelling_time_container');
                if (timeContainer) {
                    if (!endTimeString) {
                        console.error('Error: characterOperationEndDate is missing in localStorage.');
                        return;
                    }

                    const endTime = new Date(endTimeString);
                    if (isNaN(endTime)) {
                        console.error('Error: Invalid date format in characterOperationEndDate.');
                        return;
                    }

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

        const endpointForSpawn = `http://127.0.0.1:5000/fetch_spawn`;
        const spawnId = localStorage.getItem('characterActiveSpawnId');
        if (!spawnId) {
            console.error('Error: ActiveSpawnId is missing in localStorage.');
            return;
        }

        fetch(endpointForSpawn, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ spawn_id: spawnId })
        })
            .then(responseForSpawn => {
                if (!responseForSpawn.ok) {
                    throw new Error(`HTTP error! Status: ${responseForSpawn.status}`);
                }
                return responseForSpawn.json();
            })
            .then(dataForSpawn => {
                console.log('Spawn data:', dataForSpawn); // Log spawn data
                const mapContainer = document.querySelector('.travelling_destination_map_container');
                if (mapContainer) {
                    const mapImagePath = dataForSpawn.mobLocalizationOnMiniMapSource;
                    if (mapImagePath) {
                        mapContainer.innerHTML = ''; // Clear existing content
                        const mapImgElement = document.createElement('img');
                        mapImgElement.src = mapImagePath;
                        mapImgElement.alt = "Mob Localization Map";
                        mapContainer.appendChild(mapImgElement);
                    } else {
                        console.error('Error: mobLocalizationOnMiniMapSource is missing in data.');
                    }
                } else {
                    console.error('Error: Element with class "travelling_destination_map_container" not found.');
                }
                const minimapContainer = document.querySelector('.minimap_img_container .foreground-map');
                if (minimapContainer) {
                    const foregroundMapImagePath = dataForSpawn.mobLocalizationOnMiniMapSource;
                    if (foregroundMapImagePath) {
                        minimapContainer.src = foregroundMapImagePath;
                    } else {
                        console.error('Error: mobLocalizationOnMiniMapSource is missing in data.');
                    }
                } else {
                    console.error('Error: Element with class "foreground-map" not found.');
                }
            })
            .catch(error => console.error(`Error fetching spawn data from ${endpointForSpawn}:`, error));
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

    function animateImageReveal(containerId, startTime, endTime) {
        const container = document.getElementById(containerId);
        const timerDisplay = container.querySelector('.overlay-text');

        if (!container) {
            console.error(`Error: Element with ID "${containerId}" not found.`);
            return;
        }

        const startDate = new Date(startTime);
        const endDate = new Date(endTime);

        if (isNaN(startDate) || isNaN(endDate)) {
            console.error('Error: Invalid date format for startTime or endTime.');
            return;
        }

        const totalDurationMs = endDate - startDate;

        if (totalDurationMs <= 0) {
            console.error('Error: endTime must be greater than startTime.');
            return;
        }


        function updateTimerDisplay() {
            const now = new Date();
            const remainingMs = Math.max(0, endDate - now);
            const remainingSeconds = Math.floor(remainingMs / 1000);
            if (timerDisplay) {
                timerDisplay.textContent = `Mob respawning: ${remainingSeconds}s`;
            }
        }

        function animate() {
            const now = new Date();
            const elapsedMs = Math.max(0, now - startDate);
            const progress = Math.min(elapsedMs / totalDurationMs, 1);
            const currentAngle = progress * 360;


            container.style.setProperty('--angle', `${currentAngle}deg`);
            updateTimerDisplay();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                container.style.setProperty('--angle', '360deg');
                if (timerDisplay) {
                    timerDisplay.textContent = '';
                }
                container.classList.add('reveal-complete');
                console.log('Animation complete.');
            }
        }

        const now = new Date();
        if (now >= startDate && now <= endDate) {
            const elapsedMs = now - startDate;
            const initialProgress = elapsedMs / totalDurationMs;
            const initialAngle = initialProgress * 360;
            container.style.setProperty('--angle', `${initialAngle}deg`);
        } else {
            container.style.setProperty('--angle', '0deg');
        }

        updateTimerDisplay();
        requestAnimationFrame(animate);
    }

    // Call the function to update data on the page
    updateMobInfo();

});
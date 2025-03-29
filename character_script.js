document.addEventListener('DOMContentLoaded', function() {
    
    // Funkcja aktualizowania danych na stronie
    function updateData(endpoint, fields) {
        console.log("Endpoint:", endpoint); // Sprawdź, jaki endpoint jest używany
        console.log("Character ID:", localStorage.getItem("logedInCharacterId"));
        console.log("User ID:", localStorage.getItem("userId"));

        const characterId = localStorage.getItem("logedInCharacterId");
        const userId = localStorage.getItem("userId");

        fetch(endpoint, {
            method: 'POST', // Użycie metody POST
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ characterId, userId }) // Dodano userId do przesyłanych danych
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

    // Funkcja wyświetlająca sekcję o id="characterAttackStatsSection"
    function showCharacterAttackStatsSection() {
        const sectionsToHide = ['characterDefenceStatsSection', 'characterElementsStatsSection']; // Sekcje do ukrycia
        sectionsToHide.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'none'; // Ukryj sekcję
            } else {
                console.error(`Section with id "${sectionId}" not found.`);
            }
        });

        const section = document.getElementById('characterAttackStatsSection');
        if (section) {
            section.style.display = 'flex'; // Wyświetl tylko sekcję o id "characterAttackStatsSection"
        } else {
            console.error('Section with id "characterAttackStatsSection" not found.');
        }
    }

    // Funkcja obsługująca wyświetlanie odpowiednich sekcji
    function setupSectionButtons() {
        const buttons = [
            { buttonId: 'characterAttackStatsSectionButton', sectionId: 'characterAttackStatsSection' },
            { buttonId: 'characterDefenceStatsSectionButton', sectionId: 'characterDefenceStatsSection' },
            { buttonId: 'characterElementsStatsSectionButton', sectionId: 'characterElementsStatsSection' }
        ];

        let activeButton = null; // Przechowuje aktualnie podświetlony przycisk

        buttons.forEach(({ buttonId, sectionId }) => {
            const button = document.getElementById(buttonId);
            const section = document.getElementById(sectionId);

            if (button && section) {
                button.addEventListener('click', () => {
                    // Ukryj wszystkie sekcje
                    buttons.forEach(({ sectionId }) => {
                        const otherSection = document.getElementById(sectionId);
                        if (otherSection) {
                            otherSection.style.display = 'none';
                        }
                    });

                    // Wyświetl wybraną sekcję
                    section.style.display = 'flex';

                    // Usuń podświetlenie z poprzedniego przycisku
                    if (activeButton) {
                        activeButton.style.background = '';
                    }

                    // Podświetl aktualny przycisk
                    button.style.background = "linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1)), url('images/button.png')";
                    button.style.backgroundSize = "100% 100%";
                    button.style.backgroundBlendMode = "lighten";

                    // Zaktualizuj aktywny przycisk
                    activeButton = button;

                    // Wywołaj funkcję aktualizującą dane dla wybranej sekcji
                    if (sectionId === 'characterAttackStatsSection') {
                        updateCharacterInfo();
                    }
                });
            } else {
                console.error(`Button or section not found for buttonId: ${buttonId}, sectionId: ${sectionId}`);
            }
        });
    }

    // Wywołanie funkcji konfigurującej przyciski
    setupSectionButtons();

    // Wywołanie funkcji po załadowaniu strony
    showCharacterAttackStatsSection();

    function updateCharacterInfo() {
        const fields = [
            {
            elementId: 'classRaceName',
            valuePath: [],
            transform: (character) => {
                const race = character.race === "4" ? "Human" : character.race;
                const className = character.class === "8" ? "Knight" : character.class;
                return `${race} ${className}`;
            }
            },
            {
            elementId: 'characterLvl',
            valuePath: ['lvl'],
            transform: (lvl) => `Level ${lvl}`
            },
            {
            elementId: 'characterName',
            valuePath: ['name']
            },
            {
            elementId: 'experiencePoints',
            valuePath: [],
            transform: (character) => `EXP ${character.currentExperiencePoints}/${character.requiredExperiencePoints}`
            },
            {
            elementId: 'healthPoints',
            valuePath: ['hpAndMp', 'Hp'],
            transform: (hp) => `${hp.currentPoints}/${hp.baseValue + hp.additionalValue}`
            },
            {
            elementId: 'manaPoints',
            valuePath: ['hpAndMp', 'Mana'],
            transform: (mana) => `${mana.currentPoints}/${mana.baseValue + mana.additionalValue}`
            },
            {
            elementId: 'characterSta',
            valuePath: ['attributes', 'Stamina'],
            transform: (stamina) => stamina.baseValue + stamina.additionalValue
            },
            {
            elementId: 'characterStr',
            valuePath: ['attributes', 'Strength'],
            transform: (strength) => strength.baseValue + strength.additionalValue
            },
            {
            elementId: 'characterWis',
            valuePath: ['attributes', 'Wisdom'],
            transform: (wisdom) => wisdom.baseValue + wisdom.additionalValue
            },
            {
            elementId: 'characterInt',
            valuePath: ['attributes', 'Intelligence'],
            transform: (intelligence) => intelligence.baseValue + intelligence.additionalValue
            },
            {
            elementId: 'characterAgi',
            valuePath: ['attributes', 'Agility'],
            transform: (agility) => agility.baseValue + agility.additionalValue
            },
            {
            elementId: 'characterCha',
            valuePath: ['attributes', 'Charisma'],
            transform: (charisma) => charisma.baseValue + charisma.additionalValue
            },
            {
            elementId: 'characterDamage',
            valuePath: ['attributes', 'Damage'],
            transform: (damage) => damage.baseValue + damage.additionalValue
            },
            {
            elementId: 'characterHeroicAttack',
            valuePath: ['attributes', 'HeroicAttack'],
            transform: (heroicAttack) => heroicAttack.baseValue + heroicAttack.additionalValue
            },
            {
            elementId: 'characterAttackRating',
            valuePath: ['attributes', 'ARating'],
            transform: (aRating) => aRating.baseValue + aRating.additionalValue
            },
            {
            elementId: 'characterAccuracy',
            valuePath: ['attributes', 'Accuracy'],
            transform: (accuracy) => accuracy.baseValue + accuracy.additionalValue
            },
            {
            elementId: 'characterSkillCastingTime',
            valuePath: ['attributes', 'SkillCastingTime'],
            transform: (skillCastingTime) => skillCastingTime.baseValue + skillCastingTime.additionalValue
            },
            {
            elementId: 'characterSkillCooldown',
            valuePath: ['attributes', 'SkillCooldown'],
            transform: (skillCooldown) => skillCooldown.baseValue + skillCooldown.additionalValue
            },
            {
            elementId: 'characterMSpeed',
            valuePath: ['attributes', 'MSpeed'],
            transform: (mSpeed) => mSpeed.baseValue + mSpeed.additionalValue
            },
            {
            elementId: 'characterAttackSpeed',
            valuePath: ['attributes', 'ASpeed'],
            transform: (aSpeed) => aSpeed.baseValue + aSpeed.additionalValue
            },
            {
            elementId: 'characterCriticalHitRate',
            valuePath: ['attributes', 'CriticalHitRate'],
            transform: (criticalHitRate) => criticalHitRate.baseValue + criticalHitRate.additionalValue
            },
            {
            elementId: 'characterCriticalDamage',
            valuePath: ['attributes', 'CriticalDamage'],
            transform: (criticalDamage) => criticalDamage.baseValue + criticalDamage.additionalValue
            },
            {
            elementId: 'characterIgnEResis',
            valuePath: ['attributes', 'IngEResis'],
            transform: (ignEResis) => ignEResis.baseValue + ignEResis.additionalValue
            },
            {
            elementId: 'characterIgnDefence',
            valuePath: ['attributes', 'IgnDefense'],
            transform: (ignDefence) => ignDefence.baseValue + ignDefence.additionalValue
            },
            {
            elementId: 'characterRange',
            valuePath: ['attributes', 'Range'],
            transform: (range) => range.baseValue + range.additionalValue
            },
            {
            elementId: 'characterIgnorePhysicalDamage',
            valuePath: ['attributes', 'IgnorePhysicalDamage'],
            transform: (ignorePhysicalDamage) => ignorePhysicalDamage.baseValue + ignorePhysicalDamage.additionalValue
            },
            {
            elementId: 'characterBlockRate',
            valuePath: ['attributes', 'IgnoreBlockRate'],
            transform: (ignoreBlockRate) => ignoreBlockRate.baseValue + ignoreBlockRate.additionalValue
            },
            {
            elementId: 'characterIgnoreSkillBlock',
            valuePath: ['attributes', 'IgnsoreSkillBlock'],
            transform: (ignoreSkillBlock) => ignoreSkillBlock.baseValue + ignoreSkillBlock.additionalValue
            },
            {
            elementId: 'characterIgnoreMeleeAttack',
            valuePath: ['attributes', 'IgnoreMeleeAttack'],
            transform: (ignoreMeleeAttack) => ignoreMeleeAttack.baseValue + ignoreMeleeAttack.additionalValue
            },
            {
            elementId: 'characterIgnoreRangedAttack',
            valuePath: ['attributes', 'IgnoreRangedAttack'],
            transform: (ignoreRangedAttack) => ignoreRangedAttack.baseValue + ignoreRangedAttack.additionalValue
            },
            {
            elementId: 'characterIgnoreCriticalHit',
            valuePath: ['attributes', 'IgnoreCriticalHit'],
            transform: (ignoreCriticalHit) => ignoreCriticalHit.baseValue + ignoreCriticalHit.additionalValue
            },
            {
            elementId: 'characterIgnoreStunResistance',
            valuePath: ['attributes', 'IgnoreStunResistance'],
            transform: (ignoreStunResistance) => ignoreStunResistance.baseValue + ignoreStunResistance.additionalValue
            }
        ];

        updateData('http://127.0.0.1:5000/fetch_character', fields);
    }

    // Wywołanie funkcji aktualizowania danych na stronie
    updateCharacterInfo();
});
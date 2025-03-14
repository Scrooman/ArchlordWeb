document.addEventListener('DOMContentLoaded', function() {
    const menuOptions = document.querySelectorAll('.menu_option_label_container');
    const contentIframe = document.getElementById('contentIframe');

    menuOptions.forEach(option => {
        option.addEventListener('click', function() {
            const optionText = this.textContent.trim();
            loadIframeContent(optionText);
        });
    });

    function loadIframeContent(option) {
        let contentUrl = '';
        switch(option) {
            case 'Character':
                contentUrl = 'character.html';
                break;
        }

        contentIframe.src = contentUrl;
    }
});
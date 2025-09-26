// A function to update all text content on the page
const updateContent = () => {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = i18next.t(key);
    });
};

// Initialize i18next
window.addEventListener('DOMContentLoaded', async () => {
    await i18next
        .use(i18nextHttpBackend)
        .init({
            lng: localStorage.getItem('lang') || 'en', // Get saved language or default to English
            fallbackLng: 'en',
            backend: {
                loadPath: '/locales/{{lng}}/translation.json',
            },
        });

    // Update content when the language is changed
    i18next.on('languageChanged', () => {
        updateContent();
        // Save the new language choice
        localStorage.setItem('lang', i18next.language);
    });

    // Initial content update
    updateContent();

    // Language switcher logic
    const enButton = document.getElementById('lang-en');
    const mlButton = document.getElementById('lang-ml');

    if (enButton && mlButton) {
        enButton.addEventListener('click', () => i18next.changeLanguage('en'));
        mlButton.addEventListener('click', () => i18next.changeLanguage('ml'));
    }
});
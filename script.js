document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('urlInput');
    const loadButton = document.getElementById('loadButton');
    const newTabButton = document.getElementById('newTabButton');
    const tabs = document.getElementById('tabs');
    const iframeContainer = document.getElementById('iframeContainer');

    let tabCount = 0;
    let activeTabId = null;

    // Function to create a new tab
    function createTab(url) {
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.dataset.tabId = `tab-${tabCount}`;
        tab.innerHTML = `
            <span>${url}</span>
            <button class="close-button">X</button>
        `;
        const closeButton = tab.querySelector('.close-button');
        closeButton.addEventListener('click', () => removeTab(tab.dataset.tabId));
        tab.addEventListener('click', () => switchTab(tab.dataset.tabId));
        tabs.insertBefore(tab, newTabButton);

        tabCount++;
        return tab;
    }

    // Function to create an iframe
    function createIframe(url) {
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.dataset.tabId = `tab-${tabCount - 1}`; // Associate iframe with the last tab
        iframe.style.display = 'none';
        iframeContainer.appendChild(iframe);
        return iframe;
    }

    // Function to switch between tabs
    function switchTab(tabId) {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tabId === tabId);
        });
        document.querySelectorAll('iframe').forEach(iframe => {
            iframe.style.display = iframe.dataset.tabId === tabId ? 'block' : 'none';
        });
        activeTabId = tabId;
        saveTabsToLocalStorage();  // Save the current state after switching tabs
    }

    // Function to remove a tab and its iframe
    function removeTab(tabId) {
        const tab = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
        const iframe = document.querySelector(`iframe[data-tab-id="${tabId}"]`);
        if (tab && iframe) {
            tab.remove();
            iframe.remove();
            saveTabsToLocalStorage();  // Save the current state after removal
        }
    }

    // Function to save tabs and iframes to localStorage
    function saveTabsToLocalStorage() {
        const tabsData = [];
        document.querySelectorAll('.tab').forEach(tab => {
            const url = tab.querySelector('span').textContent;
            const tabId = tab.dataset.tabId;
            const iframeSrc = document.querySelector(`iframe[data-tab-id="${tabId}"]`).src;
            tabsData.push({ tabId, url, iframeSrc });
        });
        localStorage.setItem('tabsData', JSON.stringify(tabsData));
    }

    // Function to load tabs and iframes from localStorage
    function loadTabsFromLocalStorage() {
        const tabsData = JSON.parse(localStorage.getItem('tabsData')) || [];
        tabsData.forEach(data => {
            createTab(data.url);
            createIframe(data.iframeSrc);
        });

        // Set the active tab if there is a tab saved
        if (tabsData.length > 0) {
            switchTab(tabsData[tabsData.length - 1].tabId); // Default to the last opened tab
        }
    }

    // Function to load the URL into the active tab (for normal URLs and redirects)
    function loadURL() {
        const url = urlInput.value.trim();
        if (activeTabId) {
            // Check if it's a redirect URL
            if (url.startsWith('redirect://')) {
                const redirectUrl = url.slice(10);  // Remove 'redirect://' prefix
                createTab(redirectUrl);  // Create a new tab for the redirect
                createIframe(redirectUrl);  // Create an iframe for the redirect URL
                switchTab(`tab-${tabCount - 1}`);  // Switch to the new tab
            } else {
                const iframe = document.querySelector(`iframe[data-tab-id="${activeTabId}"]`);
                iframe.src = /^https?:\/\//i.test(url) ? url : `http://${url}`;  // Handle protocol if missing
                const tab = document.querySelector(`.tab[data-tab-id="${activeTabId}"]`);
                tab.querySelector('span').textContent = url;  // Update the tab's URL text
            }
            saveTabsToLocalStorage();  // Save the current state after updating the URL
        }
    }

    // Event listener for the Load button to update the current active tab
    loadButton.addEventListener('click', function() {
        const url = urlInput.value.trim();
        if (url) {
            loadURL();  // Call loadURL to update the iframe or create a new tab
        }
    });

    // Event listener for the "+" button to add a new tab
    newTabButton.addEventListener('click', function() {
        createTab('about:blank');
        createIframe('about:blank');
    });

    // Event listener for the Enter key in the URL input field
    urlInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            loadURL();  // Trigger the loadURL function when Enter is pressed
        }
    });

    // Load tabs from localStorage on page load
    loadTabsFromLocalStorage();
});

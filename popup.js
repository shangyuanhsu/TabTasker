const inputText = document.querySelector('#input-text');
const saveBtn = document.querySelector('#save-btn');
const itemsList = document.querySelector('#items-list');
const showUrlsBtn = document.querySelector('#show-urls-btn');

const saveItem = (text, type) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0].url;
        chrome.storage.sync.get(url, (data) => {
            const items = data[url] || [];
            items.push({ text, type, completed: false });
            chrome.storage.sync.set({ [url]: items }, loadItems);
        });
    });
};

const loadItems = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0].url;
        chrome.storage.sync.get(url, (data) => {
            const items = data[url] || [];
            renderItems(items);
            initSortable();
        });
    });
};

const renderItems = (items) => {
    itemsList.innerHTML = '';
    items.forEach((item, index) => {
        const li = document.createElement('li');
        if (item.type === 'task') {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = item.completed;
            checkbox.addEventListener('change', () => toggleTaskCompletion(index));
            li.appendChild(checkbox);
        }
        const span = document.createElement('span');
        span.textContent = item.text;
        if (item.completed) span.style.textDecoration = 'line-through';
        li.appendChild(span);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteItem(index));
        li.appendChild(deleteBtn);

        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy';
        copyBtn.addEventListener('click', () => copyText(item.text));
        li.appendChild(copyBtn);

        itemsList.appendChild(li);
    });
};

const toggleTaskCompletion = (index) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0].url;
        chrome.storage.sync.get(url, (data) => {
            const items = data[url] || [];
            items[index].completed = !items[index].completed;
            chrome.storage.sync.set({ [url]: items }, loadItems);
        });
    });
};

const deleteItem = (index) => {
    Swal.fire({
        width: '80%',
        text: "Do you want to delete?",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
    }).then((result) => {
        if (result.isConfirmed) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const url = tabs[0].url;
                chrome.storage.sync.get(url, (data) => {
                    const items = data[url] || [];
                    items.splice(index, 1);
                    chrome.storage.sync.set({ [url]: items }, loadItems);
                    if (items.length < 1) {
                        chrome.storage.sync.remove(url);
                    }
                });
                Swal.fire({
                    width: '80%',
                    text: "Success",
                    showConfirmButton: false,
                    timer: 600
                });
            });
        } else {
            Swal.fire({
                width: '80%',
                text: "Ok !",
                showConfirmButton: false,
                timer: 600
            });
        }
    });

};

const copyText = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        Swal.fire({
            width: '80%',
            text: "Copied to clipboard",
            showConfirmButton: false,
            timer: 600
        });
    });
};

const initSortable = () => {
    new Sortable(itemsList, {
        animation: 150,
        onEnd: () => {
            const items = Array.from(itemsList.children).map(li => ({
                text: li.querySelector('span').textContent,
                type: li.querySelector('input[type="checkbox"]') ? 'task' : 'note',
                completed: li.querySelector('input[type="checkbox"]')?.checked || false
            }));
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const url = tabs[0].url;
                chrome.storage.sync.set({ [url]: items });
            });
            loadItems();
        }
    });
};


const showTitle = () => {
    const messages = [
        'What are you thinking about?',
        'What do you need to do?',
        'Write down your key points!',
        'Write down your ideas!',
    ];

    const randomIndex = Math.floor(Math.random() * messages.length);

    const titleElement = document.querySelector('#myTitle');
    titleElement.innerText = messages[randomIndex];
}

const saveEvent = () => {
    const text = inputText.value.trim();
    const type = document.querySelector('input[name="type"]:checked').value;
    if (text) {
        saveItem(text, type);
        inputText.value = '';
        loadItems();
    }
}

const showRecordedUrls = () => {
    chrome.storage.sync.get(null, (data) => {
        const urls = Object.keys(data);
        let formattedUrls = '<div class="url-box">';
        if (!urls.length) {
            formattedUrls = 'No URLs recorded yet.';
        }

        for (let i = 0; i < urls.length; i++) {
            formattedUrls += `
            <a href="${urls[i]}">${i + 1} - ${urls[i]}</a><br>
           `;
        }

        formattedUrls += '</div>';

        Swal.fire({
            html: formattedUrls,
            width: '80%',
            showConfirmButton: true,
        });
    });
}

const init = () => {
    showTitle();
    loadItems();
    saveBtn.addEventListener('click', saveEvent);
    showUrlsBtn.addEventListener('click', showRecordedUrls);
}

document.addEventListener('DOMContentLoaded', init);

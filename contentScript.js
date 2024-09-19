
const url = window.location.href;

chrome.runtime.sendMessage({ action: "checkData", url: url }, (response) => {
    const items = response.items;
    if (items.length > 0) {
        console.log("Found saved items for this page:", items);
    } else {
        console.log("No saved items found for this page.");
    }
});
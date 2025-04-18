const STORAGE_KEY = 'BOOKSHELF_APP';
let books = [];

function isStorageExist() {
    return typeof Storage !== undefined;
}

function loadDataFromStorage() {
    const serializeData = localStorage.getItem(STORAGE_KEY);
    const data = JSON.parse(serializeData);
    if (data !== null) {
        books = data;
    }
    document.dispatchEvent(new Event('onDataLoaded'));
}

function saveDataToStorage() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        return true;
    }
    return false;
}

function findBookByTitle(title) {
    // return array can be empty or not
    return books.filter((book) =>
        book.title.toLowerCase().includes(title.toLowerCase())
    );
}

function findBookById(id) {
    // return first book or undefined
    return books.find((book) => book.id === id);
}

function removeBookById(id) {
    // return removed item
    // change the original array
    const removedArray = books.splice(
        books.findIndex((book) => book.id === id),
        1
    );

    return removedArray.length !== 0 && saveDataToStorage();
}

function updateBook(oldBook, newBook) {
    if (removeBookById(oldBook.id)) {
        books.push(newBook);
        return saveDataToStorage();
    }
    return false;
}

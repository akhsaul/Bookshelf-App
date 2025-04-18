const BOOK_ID_KEY = 'bookId';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('bookForm').addEventListener('submit', (event) => {
        event.preventDefault();
        addBook();
    });
    document
        .getElementById('searchBook')
        .addEventListener('submit', (event) => {
            event.preventDefault();
            searchBook(document.getElementById('searchBookTitle').value);
        });
    const completeBookList = document.getElementById('completeBookList');
    const incompleteBookList = document.getElementById('incompleteBookList');
    completeBookList.addEventListener('drop', dropToCompleteBookList);
    completeBookList.addEventListener('dragover', allowDrop);
    incompleteBookList.addEventListener('drop', dropToIncompleteBookList);
    incompleteBookList.addEventListener('dragover', allowDrop);
    if (isStorageExist()) {
        loadDataFromStorage();
    } else {
        showAlert('Browser kamu tidak mendukung local storage');
    }
});

document.addEventListener('onDataLoaded', () => {
    books.forEach((book) => {
        addBookItemToList(book, makeBookItem(book));
    });
});

function addBook() {
    const title = document.getElementById('bookFormTitle').value;
    const author = document.getElementById('bookFormAuthor').value;
    const year = document.getElementById('bookFormYear').valueAsNumber;
    const isComplete = document.getElementById('bookFormIsComplete').checked;
    const book = {
        id: new Date().getTime(),
        title: title,
        author: author,
        year: year,
        isComplete: isComplete,
    };
    books.push(book);
    if (saveDataToStorage()) {
        addBookItemToList(book, makeBookItem(book));
    } else {
        showAlert('Data gagal ditambah!');
    }
}

function moveBookItem(oldBookItem, oldBook) {
    // shallow copy
    const newBook = Object.assign({}, oldBook);
    newBook.isComplete = !oldBook.isComplete;
    if (updateBook(oldBook, newBook)) {
        addBookItemToList(newBook, makeBookItem(newBook));
        oldBookItem.remove();
    } else {
        showAlert('Data gagal dipindahkan!');
    }
}

function removeBookItem(parentElement) {
    // remove data
    if (removeBookById(parentElement[BOOK_ID_KEY])) {
        // remove item
        parentElement.remove();
    } else {
        showAlert('Data gagal dihapus!');
    }
}

function searchBook(title) {
    const bookArray = findBookByTitle(title);
    if (bookArray.length === 0) {
        showAlert('Data tidak ditemukan!');
    } else {
        // remove all book item
        document.getElementById('completeBookList').innerHTML = '';
        document.getElementById('incompleteBookList').innerHTML = '';
        // re-make book item
        bookArray.forEach((book) => {
            addBookItemToList(book, makeBookItem(book));
        });
    }
}

function updateBookItem(parentElement) {
    const oldBook = findBookById(parentElement[BOOK_ID_KEY]);
    const updateBookForm = document.getElementById('updateBookForm');
    const updateBookFormTitle = document.getElementById('updateBookFormTitle');
    const updateBookFormAuthor = document.getElementById(
        'updateBookFormAuthor'
    );
    const updateBookFormYear = document.getElementById('updateBookFormYear');
    const updateBookFormIsComplete = document.getElementById(
        'updateBookFormIsComplete'
    );
    const queryButtonClose = document.querySelectorAll(
        '#modal button.btnCloseModal'
    );
    // insert data into update form
    updateBookFormTitle.value = oldBook.title;
    updateBookFormAuthor.value = oldBook.author;
    updateBookFormYear.value = oldBook.year;
    updateBookFormIsComplete.checked = oldBook.isComplete;
    // show a modal contain update form
    showModal('modal');
    const eventUpdateBook = (event) => {
        event.preventDefault();
        const newBook = {
            id: oldBook.id,
            title: updateBookFormTitle.value,
            author: updateBookFormAuthor.value,
            year: updateBookFormYear.value,
            isComplete: updateBookFormIsComplete.checked,
        };
        if (updateBook(oldBook, newBook)) {
            parentElement.remove();
            addBookItemToList(newBook, makeBookItem(newBook));
            // hide a modal contain update form
            hideModal('modal');
            // remove current event
            // prevent multiple event fired!
            updateBookForm.removeEventListener('submit', eventUpdateBook);
            queryButtonClose.forEach((element) => {
                element.removeEventListener('click', eventHideModal);
            });
        } else {
            showAlert('Update gagal!');
        }
    };
    const eventHideModal = (event) => {
        event.stopPropagation();
        // hide a modal contain update form
        hideModal('modal');
        // remove current event
        // prevent multiple event fired!
        updateBookForm.removeEventListener('submit', eventUpdateBook);
        queryButtonClose.forEach((element) => {
            element.removeEventListener('click', eventHideModal);
        });
    };
    // register event
    updateBookForm.addEventListener('submit', eventUpdateBook);
    queryButtonClose.forEach((element) => {
        element.addEventListener('click', eventHideModal);
    });
}

function makeBookItem(book) {
    const title = createElement('h3', 'bookItemTitle', book.title, 'mb-2');
    const author = createElement(
        'p',
        'bookItemAuthor',
        'Penulis: ' + book.author,
        'mb-2'
    );
    const year = createElement(
        'p',
        'bookItemYear',
        'Tahun: ' + book.year,
        'mb-2'
    );
    let labelIsComplete;
    let classIsComplete;
    if (book.isComplete) {
        labelIsComplete = 'Belum selesai dibaca';
        classIsComplete = 'btn-secondary';
    } else {
        labelIsComplete = 'Selesai dibaca';
        classIsComplete = 'btn-success';
    }
    const buttonIsComplete = createButton(
        'bookItemIsCompleteButton',
        labelIsComplete,
        classIsComplete,
        (event) => {
            moveBookItem(
                event.target.parentElement,
                findBookById(event.target.parentElement[BOOK_ID_KEY])
            );
        }
    );
    const buttonDelete = createButton(
        'bookItemDeleteButton',
        'Hapus buku',
        'btn-danger ms-2',
        (event) => {
            removeBookItem(event.target.parentElement);
        }
    );
    const buttonEdit = createButton(
        'bookItemEditButton',
        'Ubah buku',
        'btn-primary ms-2',
        (event) => {
            updateBookItem(event.target.parentElement);
        }
    );
    const containerItem = createElement(
        'div',
        'bookItem',
        undefined,
        'border border-primary rounded mb-3 py-2 px-3'
    );
    containerItem.setAttribute('data-bookid', book.id);
    containerItem.setAttribute('draggable', 'true');
    containerItem.append(
        title,
        author,
        year,
        buttonIsComplete,
        buttonDelete,
        buttonEdit
    );
    containerItem[BOOK_ID_KEY] = book.id;
    containerItem.addEventListener('dragstart', drag);
    return containerItem;
}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData('text', event.target[BOOK_ID_KEY]);
}

function dropToCompleteBookList(event) {
    event.preventDefault();
    const bookId = event.dataTransfer.getData('text');
    if (bookId !== undefined) {
        const oldBook = findBookById(Number(bookId));
        // the book should be incomplete (false)
        // don't move the book if it's not from IncompleteBookList
        if (oldBook.isComplete === false) {
            let bookItem = searchElementById('incompleteBookList', oldBook.id);
            moveBookItem(bookItem, oldBook);
        } else {
            // don't show alert, because it's not error
            // user can cancel drag at anywhere
            console.log("Can't drop to CompleteBookList");
        }
    }
}

function dropToIncompleteBookList(event) {
    event.preventDefault();
    const bookId = event.dataTransfer.getData('text');
    if (bookId !== undefined) {
        const oldBook = findBookById(Number(bookId));
        // the book should be incomplete (true)
        // don't move the book if it's not from CompleteBookList
        if (oldBook.isComplete === true) {
            let bookItem = searchElementById('completeBookList', oldBook.id);
            moveBookItem(bookItem, oldBook);
        } else {
            // don't show alert, because it's not error
            // user can cancel drag at anywhere
            console.log("Can't drop to IncompleteBookList");
        }
    }
}

function addBookItemToList(newBook, newBookItem) {
    if (newBook.isComplete) {
        document.getElementById('completeBookList').appendChild(newBookItem);
    } else {
        document.getElementById('incompleteBookList').appendChild(newBookItem);
    }
}

function searchElementById(idParent, bookId) {
    let bookItem = undefined;
    const list = document.getElementById(idParent);
    for (const element of list.children) {
        const id = element[BOOK_ID_KEY];
        // search element contain bookId
        if (id !== undefined && id === bookId) {
            bookItem = element;
            break;
        }
    }
    // result still can be undefined (not found)
    return bookItem;
}

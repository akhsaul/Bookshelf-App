function createElement(element, attrTestValue, innerText, className) {
    const docElement = document.createElement(element);
    if (attrTestValue !== undefined) {
        docElement.setAttribute('data-testid', attrTestValue);
    }
    if (innerText !== undefined) {
        docElement.innerText = innerText;
    }
    if (className !== undefined) {
        docElement.className = className;
    }
    return docElement;
}

function createButton(attrTestValue, innerText, extraClassName, eventListener) {
    const button = createElement(
        'button',
        attrTestValue,
        innerText,
        'btn ' + extraClassName
    );
    button.type = 'button';
    button.addEventListener('click', eventListener);
    return button;
}

function hideModal(elementId) {
    const modal = document.getElementById(elementId);
    // clear all input
    const inputElement = modal.getElementsByTagName('input');
    for (const element of inputElement) {
        if (element.type === 'checkbox') {
            element.checked = false;
        } else {
            element.value = '';
        }
    }
    // fix for aria-hidden warning
    document.activeElement.blur();
    // start to hide a modal
    modal.classList.remove('show');
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('aria-modal');
    modal.removeAttribute('role');
    // reset fullwidth
    document.body.style.paddingRight = '';
    // show the scroll
    document.body.style.overflow = '';
    // remove the backdrop
    document
        .querySelectorAll('body>div.modal-backdrop')
        .forEach((element) => element.remove());
}

function showModal(elementId) {
    const documentWidth = document.documentElement.clientWidth;
    const width = Math.abs(window.innerWidth - documentWidth);
    // maintain fullwidth when scroll is hide
    document.body.style.paddingRight = width + 'px';
    // hide the scroll
    document.body.style.overflow = 'hidden';
    // add the backdrop
    const backdrop = document.createElement('div');
    backdrop.classList.add('modal-backdrop', 'fade', 'show');
    document.body.appendChild(backdrop);
    // start to show a modal
    const modal = document.getElementById(elementId);
    modal.style.display = 'block';
    modal.removeAttribute('aria-hidden');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('role', 'dialog');
    modal.classList.add('show');
    // animate it! when click outside modal
    modal.addEventListener('click', () => {
        modal.classList.add('modal-static');
        setTimeout(() => modal.classList.remove('modal-static'), 300);
    });
    // don't animate if body modal clicked!
    for (const child of modal.children) {
        child.addEventListener('click', (event) => event.stopPropagation());
    }
}

function showAlert(message) {
    alert(message);
}

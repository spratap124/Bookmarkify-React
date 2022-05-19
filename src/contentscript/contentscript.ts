import './contentscript.scss';


let bookmarkBtn:HTMLElement;
// set the selecte text to empty initially 
let selectedText = ""

const isEnabled = () => {
    let checkLocalStorage = localStorage.getItem('bookmarkifyEnabled');
    if(checkLocalStorage != null){
        return checkLocalStorage
    }else{
        enable()
        return true;
    }
}

const enable = () => {
    localStorage.setItem('bookmarkifyEnabled','true')
}

const disable = () => {
    localStorage.setItem('bookmarkifyEnabled','false')
}

const initBookmarkify = () => {

    const body = document.getElementsByTagName('body')[0]

    // create a button to bookmark a section
    const btn = document.createElement('span')
    //  btn.innerHTML = '&#128278';
    const icon = document.createElement("div")
    icon.className = 'bookmarkIcon'
    icon.id = 'bkIcon';
    btn.appendChild(icon)
    btn.className = 'bookmarkBtn';
    btn.setAttribute('title', 'Bookmark this line')
    btn.id = 'bookmarkBtn'

    // add button to current web page
    body.appendChild(btn)

    // get bookmark button element from DOM
     bookmarkBtn = document.getElementById('bookmarkBtn');

    // add an event to get the selected text
    document.addEventListener('mouseup', onTextSelected, false);

    // hide bookmark button if nothing is selected
    document.addEventListener('mousedown', onSelectionRemove)
    
    // add new click event to save a bookmark
    bookmarkBtn.addEventListener('click', addAbookmark)
}

const onTextSelected = (event:MouseEvent) => {
    bookmarkBtn = document.getElementById('bookmarkBtn');
    if(isEnabled()){
        let newSelectedText = getSelectionText();

    if (newSelectedText !== "") {
        selectedText = newSelectedText;
        const x = event.pageX;
        const y = event.pageY;

        // show the bookmark icon near the selected text
        bookmarkBtn.classList.add('show')
        bookmarkBtn.style.left = (x + 10)+ 'px';
        bookmarkBtn.style.top = y + 'px';
    }
    }
}

const onSelectionRemove = (event) => {
    console.log('keycode',event)
    if(event.which != 3){
        if (bookmarkBtn.style.display == 'block' && event.target.id !== 'bookmarkBtn' && event.target.id !== 'bkIcon') {
            bookmarkBtn.classList.remove('show')
            window.getSelection().empty();
        }
    }else{
        bookmarkBtn.classList.remove('show')
    }
}

const addAbookmark = (event) => {

    let bookmarkList = JSON.parse(localStorage.getItem('bookmarks')) || {}
    let currentURL = window.location.href;
    let title = selectedText;
    let pos = event.pageY;

    const bookmark = {
        title: title,
        top: pos,
        color: getRandomColor()
    }

    // if bookmark is created for the current site
    if (bookmarkList) {

        let currentPageBookmarkList = getBookmark(bookmarkList);

        // if there are existing bookmarks for the current page
        if (currentPageBookmarkList) {
            currentPageBookmarkList.push(bookmark)
            bookmarkList[currentURL] = currentPageBookmarkList;
            saveToLocalStorage(bookmarkList)
        } else {
            // set the bookmark for the current
            setBookmark(bookmarkList, bookmark)
            saveToLocalStorage(bookmarkList);
        }

    } else {
        bookmarkList[currentURL] = []
        bookmarkList[currentURL].push(bookmark)
        //setBookmark(bookmarkList)
        saveToLocalStorage(bookmarkList);
    }

    // hide the bookmark button
    bookmarkBtn.classList.remove('show')
    drawBookmarkBar();
}

const getSelectionText = () => {
    return window.getSelection().toString().trim();
}

// get bookmarks for the current page
const getBookmark = (bookmarkList) => {
    let currentURL = window.location.href;
    return bookmarkList[currentURL]
}

// set bookmakrs for the current page
const setBookmark = (bookmarkList, bookmark) => {

    let currentURL = window.location.href;

    bookmarkList[currentURL] = []
    bookmarkList[currentURL].push(bookmark)
}

// save the bookmarks to the local storage
const saveToLocalStorage = (bookmarkList) => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarkList))
}


const drawBookmarkBar = () => {
    const body = document.getElementsByTagName('body')[0]
    const url = window.location.href;

    // delete any existing bookmarkbar
    let existingBookmarkBar = document.getElementById('bookmarkBar')

    if (existingBookmarkBar) {
        body.removeChild(existingBookmarkBar)
    }

    let bookmarkBar = document.createElement('div');
    bookmarkBar.id = 'bookmarkBar'
    let bookmarkList = JSON.parse(localStorage.getItem('bookmarks'));
    // if bookmarks are created then , draw bookmarkbar
    if (bookmarkList !== null) {
        let list = bookmarkList[url]
        if (list) {
            if(list.length !=0){
                // create navigation dots to scroll to the bookmark location
                for (let bookmark of list) {
                    let dot = getBookmarkDot(bookmark)
                    bookmarkBar.appendChild(dot)
                }
                body.appendChild(bookmarkBar)
            }
            
        }

    }
}


// retuns a div element indicating the navigation dot
const getBookmarkDot = (bookmark) => {
    let dot = document.createElement('div');
    dot.className = 'dot'
    dot.style.backgroundColor = bookmark.color;
    // dot.style.backgroundColor = '#E91E63';

    dot.title = 'Go to ➡️ ' + bookmark.title;

    // add click event to scroll to this bookmark
    addClickEvent(dot, bookmark)

    return dot;
}

// generates random hex color code for the bookmark dot
const getRandomColor = () => {
    let colors = ['#d32f2f', '#E91E63', '#8E24AA', '#33691E', '#FF6F00', '#3E2723', '#607D8B', '#FFEE58', '#8BC34A', '#2962FF']
    let randomColor = colors[Math.floor(Math.random() * colors.length)];
    return randomColor;
}


const addClickEvent = (el, bookmark) => {

  const onDotClicked = () => {
    let scrollTo = bookmark.top - 50 > 0 ? bookmark.top - 50 : 0
      window.scrollTo(0, scrollTo)
  }

    el.addEventListener('click', onDotClicked, false)
    
}

const disableBookmarkify = () => {
    // set disable in local storage
    disable();
    let bookmarkBar = document.getElementById('bookmarkBar')
    //hide bookmark bar
    if(bookmarkBar){
        bookmarkBar.classList.add('hide')
    }

    // disable text selection 
    document.removeEventListener('mouseup',onTextSelected,false);
}

const enableBookmarkify = () => {
    // set enable in local storage
    enable();
    init();
    let bookmarkBar = document.getElementById('bookmarkBar')
    //hide bookmark bar
    if(bookmarkBar){
        bookmarkBar.classList.remove('hide')
    }
}

const getBookmarksFromLocalStorage = () => {
    let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || {}
    let currentURL = window.location.href;
    if (bookmarks) {
        return bookmarks[currentURL]
    } else {
        bookmarks
    }
}

const deleteBookmark = (index) => {
    let bookmarks = JSON.parse(localStorage.getItem('bookmarks'));
    let currentURL = window.location.href;
    let currentPageBookmarkList = bookmarks[currentURL];
    currentPageBookmarkList.splice(index, 1)
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks))
}
// if scrollTo presents in query params then automatically scroll on page load
const scrollOnPageLoad = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const scrollTo = +urlParams.get('scrollTo');
    if(scrollTo){
        scrollToPosition(scrollTo)
    }
}

// scroll the page to specific distance from top
const scrollToPosition = (top) =>{
    window.scrollTo(0, top)
}

const  init = ()=> {
    if(isEnabled() != 'false'){
        scrollOnPageLoad()
        initBookmarkify();
        drawBookmarkBar();
    }
};

init()


// chrome eventes 
chrome.runtime.onMessage.addListener(
     (request, sender, sendResponse) => {
        let msg = request.msg;

        if (msg == 'getBookmarks') {
            let bookmarks = getBookmarksFromLocalStorage();
            console.log(bookmarks)
            sendResponse(bookmarks);
        }
        if (msg == 'deleteBookmark') {
            let index = request.index;
            deleteBookmark(index)
            drawBookmarkBar();
            sendResponse(getBookmarksFromLocalStorage());
        }
        if (msg == 'enable') {
            enableBookmarkify();
            sendResponse(isEnabled())
        }
        if(msg == 'disable'){
            disableBookmarkify();
            sendResponse(isEnabled())
        }
        if(msg == 'isEnabled'){
            sendResponse(isEnabled());
        }
        if(msg == 'scrollTo'){
            let top = request.top;
            scrollToPosition(top)
        }
    }
);

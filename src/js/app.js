import { select, classNames } from './settings.js';

class SongsList {
    constructor(dataService, isRandomMode = false) {
        this.dataService = dataService;
        this.isRandomMode = isRandomMode;
        this.renderDOM();
        const songs = this.dataService.data;
            if (this.isRandomMode) {
                const randomSong = Randomizer.getRandom(songs);
                this.initList([randomSong]);
            } else {
                this.initList(songs); 
            }
    }
    renderDOM() {
        this.container = document.createElement('div');
        this.container.classList.add('song-list');
        document.body.appendChild(this.container);
    }
    initList(songs) {
        this.container.innerHTML = '';

        if(!songs || songs.length === 0) {
            this.showNoResults();
            return;
        }

        for (let song of songs) {
            new SongPlayer(this.container, song);
        }
    }

    showNoResults() {
        const noResultsHTML = `
            <div class="no-results">
                <h3>No songs found</h3>
                <p>Try adjusting your search terms or filters</p>
            </div>
        `;
        this.container.innerHTML = noResultsHTML;
    }
}

class Randomizer {  
  static getRandom(data = []) {
    const randomId = Math.floor((Math.random() * data.length));    
    return data[randomId];
  }
}
class SongPlayerFactory {
    static create(container, song) {
        const wrapper = SongPlayerFactory.createPlayerWrapper(song.filename)
        container.appendChild(wrapper);
        return wrapper;
    }

    static createPlayerWrapper(filename) {
        const playerWrapper = document.createElement('div');
        playerWrapper.classList.add('player');
        playerWrapper.appendChild(SongPlayerFactory.createAudioElement(filename));
        return playerWrapper;
    }
    static createAudioElement(filename) {
        const audioElement = document.createElement('audio');
        audioElement.appendChild(SongPlayerFactory.createAudioSourceElement(filename));
        return audioElement;
    }
    static createAudioSourceElement(filename) {
        const source = document.createElement('source');
        source.src = `songs/${filename}`;
        source.type = `audio/mpeg`;
        return source;
    }
}

class SongPlayer {
    constructor(container, song) {
        this.initSong(container, song);
    }

    initSong(container, song) {
        const player = SongPlayerFactory.create(container, song);
        new GreenAudioPlayer(player);
    }
}

class SearchService {
    constructor(dataService) {
        this.dataService = dataService;
    }

    searchSongs(query, searchBy = 'all') {
        const songs = this.dataService.data;
        if(!query || query.trim() === '') {
            return songs;
        }

        const searchQuery = query.toLowerCase().trim();

        return songs.filter(song => {
            switch(searchBy) {
                case 'title': 
                    return song.title.toLowerCase().includes(searchQuery);
                case 'author':
                    return song.author.toString().includes(searchQuery);
                case 'categories':
                    return song.categories.some(category => category.toLowerCase().includes(searchQuery));
                case 'ranking':
                    return song.ranking.toString().includes(searchQuery);
                default: 
                    return song.title.toLowerCase().includes(searchQuery) ||
                           song.author.toString().includes(searchQuery) ||
                           song.categories.some(category => category.toLowerCase().includes(searchQuery)) ||
                           song.ranking.toString().includes(searchQuery)
            }
        })
    }
}
class DataService {
    constructor() {
    }
       
    fetchSongs() {
        return fetch('/db/app.json')
            .then(res => {
                return res.json(); 
            })
            .then(data => {
                this.data = data.songs;
            })
    }
}

const app = {
    currentSongsList: null,
    searchContainer: null,

    cleanup: function() {
        const thisApp = this;

        if(thisApp.currentSongsList?.container) {
            thisApp.currentSongsList.container.remove();
            thisApp.currentSongsList = null;
        }
        if (thisApp.searchContainer) {
            thisApp.searchContainer.remove();
            thisApp.searchContainer = null; 
        }
    },
    initPages: function () {
        const thisApp = this;

        thisApp.pages = document.querySelector(select.containerOf.pages).children;

        thisApp.navLinks = document.querySelectorAll(select.nav.links);

        let pageMatchingHash = thisApp.pages[0].id;
        const idFromHash = window.location.hash;
        for (let page of thisApp.pages) {
            if (page.id == idFromHash) {
                pageMatchingHash = page.id;
                break;
            }
        }
        thisApp.activatePage(thisApp.pages[0].id);

        for (let link of thisApp.navLinks) {
            link.addEventListener('click', function (event) {
                const clickedElement = this;
                event.preventDefault();
                const id = clickedElement.getAttribute('href').replace('#', '');
                thisApp.cleanup();

                switch(id) {
                    case 'discover':
                        thisApp.initDiscoverPage();
                        break;
                    case 'home':
                        thisApp.initHomePage();
                        break;
                    case 'search':
                        thisApp.initSearchPage();
                        break;
                }
                thisApp.activatePage(id);
                window.location.hash = '#/' + id;
            })
        }
    },

    activatePage: function (pageId) {
        const thisApp = this;
        for (let page of thisApp.pages) {
            page.classList.toggle(classNames.pages.active, page.id == pageId);
        }
        for (let link of thisApp.navLinks) {
            link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
        }
    },

    initHomePage: function () {
        const thisApp = this;
        thisApp.currentSongsList = new SongsList(dataService);
    },

    initDiscoverPage: function () {
        const thisApp = this;
        thisApp.currentSongsList = new SongsList(dataService, true);
    },

    initSearchPage: function () {
        const thisApp = this;
        thisApp.searchContainer = '';
        thisApp.searchHTML = '';
        thisApp.searchContainer = document.createElement('div');
        thisApp.searchContainer.classList.add('search-container');

        thisApp.searchHTML = `
            <div class="search-controls">
                <input id="search-input" type="text" placeholder="Search by title, author, category, or ranking." class="search-input">
                <select id="search-filter" class="search-filter">
                    <option value="all">All</option>
                    <option value="title">Title</option>
                    <option value="author">Author</option>
                    <option value="categories">Categories</option>
                    <option value="ranking">Ranking</option>
                </select>
            </div>
            <div class="search-results"></div>
        `;
        thisApp.searchContainer.innerHTML = thisApp.searchHTML;

        const searchPage = document.querySelector('#search');
        searchPage.appendChild(thisApp.searchContainer);

        const searchService = new SearchService(dataService);

        thisApp.currentSongsList = new SongsList(dataService);
        const resultsContainer = thisApp.searchContainer.querySelector('.search-results');
        resultsContainer.appendChild(thisApp.currentSongsList.container);

        const searchInput = thisApp.searchContainer.querySelector('#search-input');
        const searchFilter = thisApp.searchContainer.querySelector('#search-filter');

        function performSearch() {
            const query = searchInput.value;
            const filterBy = searchFilter.value;
            const filteredSongs = searchService.searchSongs(query, filterBy);

            thisApp.currentSongsList.initList(filteredSongs);

            const resultsCount = document.querySelector('.results-count');
            if(resultsCount) {
                resultsCount.remove();
            }

            const countDiv = document.createElement('div');
            countDiv.classList.add('results-count');
            countDiv.textContent = `Found ${filteredSongs.length} songs(s)`;
            resultsContainer.insertBefore(countDiv, thisApp.currentSongsList.container);
        }

        searchInput.addEventListener('input', performSearch);
        searchFilter.addEventListener('change', performSearch);

        const clearButton = document.createElement('button');
        clearButton.textContent = 'Clear';
        clearButton.classList.add('clear-search-btn');
        clearButton.addEventListener('click', function() {
            searchInput.value = '';
            searchFilter.value = 'all';
            performSearch();
        });

        thisApp.searchContainer.querySelector('.search-controls').appendChild(clearButton);
    },

    init: function() {
        const thisApp = this;
  
        console.log('*** App starting ***');
        // console.log('thisApp:', thisApp);
        // console.log('classNames:', classNames);
        // console.log('settings:', settings);
        // console.log('templates:', templates);
      
        thisApp.initPages();
        //thisApp.initPlayer(); 
        thisApp.currentSongsList = new SongsList(dataService);
    },
}

const dataService = new DataService(); 
dataService.fetchSongs().then(() => {
    app.init();
});
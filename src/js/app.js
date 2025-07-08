import { select, classNames } from './settings.js';

class SongsList {
    constructor(dataService, isRandomMode = false) {
        this.dataService = dataService;
        this.isRandomMode = isRandomMode;
        console.log('!', this.dataService);
        this.renderDOM();
        this.dataService.fetchSongs().then((songs) => {
            if (this.isRandomMode) {
                const randomSong = Randomizer.getRandom(songs);
                this.initList([randomSong]);
            } else {
                this.initList(songs); 
            }
        }); 
    }
    renderDOM() {
        this.container = document.createElement('div');
        this.container.classList.add('song-list');
        document.body.appendChild(this.container);
    }
    initList(songs) {
        console.log(songs, this.container);
        this.container.innerHTML = '';
        for (let song of songs) {
            new SongPlayer(this.container, song);
        }
    }
}
class FactoryPlayers {

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
//class service FetchSong // create class service // dependency injection
/* poczytać o dependency injection - piwnica prog.  */
class SongPlayer {
    constructor(container, song) {
        console.log('song', song);
        //this.song = song; 
        //this.container = container;
        this.initSong(container, song);
    }

    initSong(container, song) {
        const player = SongPlayerFactory.create(container, song);
        new GreenAudioPlayer(player);
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
                
                return data.songs;
            })
    }
}

const app = {
    currentSongsList: null,

    initPages: function () {
        const thisApp = this;

        thisApp.pages = document.querySelector(select.containerOf.pages).children;

        thisApp.navLinks = document.querySelectorAll(select.nav.links);

        let pageMatchingHash = thisApp.pages[0].id;
        const idFromHash = window.location.hash;
        console.log(pageMatchingHash);
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
                if (id === 'discover') {
                    thisApp.initDiscoverPage();
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

    initHome: function () {
    },

    initDiscoverPage: function () {
        const thisApp = this;
        if (thisApp.currentSongsList && thisApp.currentSongsList.container) {
            thisApp.currentSongsList.container.remove();
        }
        const dataService = new DataService();
        thisApp.currentSongsList = new SongsList(dataService, true);
    },

    init: function() {
        const thisApp = this;
  
        console.log('*** App starting ***');
        // console.log('thisApp:', thisApp);
        // console.log('classNames:', classNames);
        // console.log('settings:', settings);
        // console.log('templates:', templates);
      
        thisApp.initPages();
        thisApp.initHome(); 
        //thisApp.initPlayer(); 
        const dataService = new DataService(); 
        thisApp.currentSongsList = new SongsList(dataService);
    },
}

app.init();
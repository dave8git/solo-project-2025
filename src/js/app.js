import { select, classNames } from './settings.js';

class SongsList {
    constructor(dataService) {
        this.dataService = dataService;
        console.log('!', this.dataService);
        this.renderDOM();
        this.dataService.fetchSongs().then((songs) => {
            this.initList(songs); 
        }); 
    }

    renderDOM() {
        this.container = document.createElement('div');
        document.body.appendChild(this.container);
    }

    initList(songs) {
        console.log(songs, this.container);
        for (let song of songs) {
            new SongPlayer(this.container, song);
        }
    }

    // here song search
}


// --- Zrobić klasę dla audio factory player --- // 
// CHatGPT: co to jest fabryka, i podaj przykłady (js)

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
        this.song = song; 
        this.container = container;
        this.initSong(song, container);
    }

    initSong() {
        const player = SongPlayerFactory.create(this.container, this.song);
        new GreenAudioPlayer(player);
    }
}

class DataService { // search could be here but class has to be called from SongsList
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
                /* get page id from href attribute */
                const id = clickedElement.getAttribute('href').replace('#', '');
                /* run thisApp.activatePage with that id */
                thisApp.activatePage(id);
                /* channge URL hash */
                window.location.hash = '#/' + id;
            })
        }
    },

    activatePage: function (pageId) {
        const thisApp = this;
        /* add class "active to matching pages, remove non-maching */
        for (let page of thisApp.pages) {
            page.classList.toggle(classNames.pages.active, page.id == pageId);
            // if(page.id == pageId) {
            //   page.classList.add(classNames.pages.active);
            // } else {
            //   page.classList.remove(classNames.pages.active);
            // }
        }
        /* add class "active" to matching links, remove from non-matching */
        for (let link of thisApp.navLinks) {
            link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
        }
    },

    initHome: function () {
        // inicjalizacja klasy home
    },

    // initPlayer: function () {
    //     const players = document.querySelectorAll('.players .player');

    //     for (let player of players) {
    //         new GreenAudioPlayer(player);
    //     }
    // },

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
        new SongsList(dataService);

      },
}

app.init();
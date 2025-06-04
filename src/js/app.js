import { select, classNames } from './settings.js';

class SongsList {
    constructor(dataService) {
        this.dataService = dataService;
        this.renderDOM();
        dataService.fetchSongs().then(() => {
            this.initList(); 
        }); 
    }

    renderDOM() {
        this.container = document.createElement('div');
        document.body.appendChild(this.container);
    }

    initList() {
        console.log(this.songs);
        this.songs = this.dataService.songs;
        for (let song of this.songs) {
            SongFactory.create(song, this.container);
        }
    }

    // here song search
}

class SongFactory {
    static create(song, container) {
        if (song.type === 'random') {
            return new RandomSong(song, container);
        } else {
            return new SongPlayer(song, container);
        }
    }
}

class RandomSong {
    constructor(song, container) {
        this.song = song;
        this.container = container;
        this.init();
        //this.renderDOM();
    }

    init() {
        const message = document.createElement('p');
        message.innerText = `🎲 Random pick: ${this.song.title}`;
        this.container.appendChild(message);
    }
}

//class service FetchSong // create class service // dependency injection
/* poczytać o dependency injection - piwnica prog.  */

class SongPlayer {
    constructor(song, container) {
        console.log('song', song);
        this.song = song; 
        this.container = container;
        this.initSong();
    }

    initSong() {
        this.playerWrapper = document.createElement('div');
        this.playerWrapper.classList.add('player');
        const audioElement = document.createElement('audio');
        this.playerWrapper.appendChild(audioElement);
        const source = document.createElement('source');
        source.src = `songs/${this.song.filename}`;
        source.type = `audio/mpeg`;
        audioElement.appendChild(source);
        this.container.appendChild(this.playerWrapper);
        new GreenAudioPlayer(this.playerWrapper);
    }
    createAudioElement() {
        
    }
    createSourceForAudio() {

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
                this.songs = data.songs;
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
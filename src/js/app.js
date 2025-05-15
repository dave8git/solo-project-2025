import { select, classNames } from './settings.js';

class SongsList {
    constructor() {
        this.fetchSongs().then(() => {
            this.initList(); 
        }); 
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

    initList() {
        console.log(this.songs);
        for (let song of this.songs) {
            new SongPlayer(song);
        }
    }

    // here song search
}

class RandomSong {
    //
}

class service FetchSong // create class service // dependency injection
/* poczytać o dependency injection - piwnica prog.  */

class SongPlayer {
    constructor(song) {
        console.log('song', song);
    }

    // create handlebars templace
    // call method greenAudioPlayer
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
        // thisApp.initPlayer(); 
        
        new SongsList(); 

      },
}

app.init();
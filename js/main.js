App = window.App || {};

App.Main = (function Main() {
    var player;
    var popupEl;
    var videoListEl;
    var logger;
    var selectedVideoEl;
    var basicMenu = App.Navigation.getMenu('Basic');
    var playerStates = App.VideoPlayer.playerStates;

    var streamData = [
        {
            manifest: 'http://uhd01.iev.vcdn.biz/8k/8K_samsung/8K_Paddington_25Mb.mp4',
            streamName: '8K 25Mb SDR MP4'
        },
        {
            manifest: 'http://uhd01.iev.vcdn.biz/8k/8K_samsung/25Mb/stream.mpd',
            streamName: '8K 25Mb SDR MPD'
        },
        {
            manifest: 'http://uhd01.iev.vcdn.biz/8k/8K_samsung/8K_Paddington_25Mb_HDR.mp4',
            streamName: '8K 25Mb HDR10 MP4'
        },
        {
            manifest: 'http://uhd01.iev.vcdn.biz/8k/8K_samsung/25Mb/stream.mpd',
            streamName: '8K 25Mb HDR10 MPD'
        },
        {
            manifest: 'http://uhd01.iev.vcdn.biz/8k/8K_samsung/8K_Paddington_25Mb_HDRplus.mp4',
            streamName: '8K 25Mb HDR10+ MP4'
        },
        {
            manifest: 'http://uhd01.iev.vcdn.biz/8k/8K_samsung/25Mb_HDRplus/stream.mpd',
            streamName: '8K 25Mb HDR10+ MPD'
        },
        {
            manifest: 'http://uhd01.iev.vcdn.biz/8k/8K_samsung/8K_Paddington_45Mb.mp4',
            streamName: '8K 45Mb SDR MP4'
        },
        {
            manifest: 'http://uhd01.iev.vcdn.biz/8k/8K_samsung/45Mb/stream.mpd',
            streamName: '8K 45Mb SDR MPD'
        },
        {
            manifest: 'http://uhd01.iev.vcdn.biz/8k/8K_samsung/8K_Paddington_45Mb_HDR.mp4',
            streamName: '8K 45Mb HDR10 MP4'
        },
        {
            manifest: 'http://uhd01.iev.vcdn.biz/8k/8K_samsung/45Mb_HDR/stream.mpd',
            streamName: '8K 45Mb HDR10 MPD'
        },
        {
            manifest: 'http://uhd01.iev.vcdn.biz/8k/8K_samsung/8K_Paddington_45Mb_HDRplus.mp4',
            streamName: '8K 45Mb HDR10+ MP4'
        },
        {
            manifest: 'http://uhd01.iev.vcdn.biz/8k/8K_samsung/45Mb_HDRplus/stream.mpd',
            streamName: '8K 45Mb HDR10+ MPD'
        },
        {
            manifest: 'http://uhd01.iev.vcdn.biz/8k/8K_samsung/8K_Paddington_75Mb.mp4',
            streamName: '8K 75Mb SDR MP4'
        },
        {
            manifest: 'http://uhd01.iev.vcdn.biz/8k/8K_samsung/75Mb/stream.mpd',
            streamName: '8K 75Mb SDR MPD'
        }
    ];


    function onReturn() {
        var playerState = player.getState();

        if (playerState !== playerStates.IDLE && playerState !== playerStates.NONE) {
            player.stop();
        } else {
            tizen.application.getCurrentApplication().hide();
        }
    }

    function registerNavigation() {
        App.Navigation.registerMenu({
            domEl: document.querySelector('#video-select'),
            name: 'chooseVideoButton',
            nextMenu: 'Basic',
            onAfterLastItem: function () {
                App.Navigation.changeActiveMenu('VideoMenu');
            }
        });

        App.Navigation.registerMenu({
            domEl: document.querySelector('#closeButton'),
            name: 'closePopup',
            nextMenu: 'popupMenu',
            previousMenu: 'popupMenu',
            onAfterLastItem: function () {
                App.Navigation.changeActiveMenu('popupMenu');
            },
            onBeforeFirstItem: function () {
                App.Navigation.changeActiveMenu('popupMenu');
            }
        });

        App.Navigation.registerMenu({
            domEl: videoListEl,
            name: 'popupMenu',
            alignment: 'vertical',
            onActiveItemChanged: scroll,
            nextMenu: 'closePopup'
        });

        basicMenu.previousMenu = 'chooseVideoButton';
    }

    function scroll(focusedEl) {
        App.Utils.scrollToCurrent(videoListEl, focusedEl);
    }


    function runPopupMenu() {
        popupEl.classList.toggle('hidden');
        App.Navigation.changeActiveMenu('popupMenu');
    }

    function returnFromPopup() {
        popupEl.classList.toggle('hidden');
        App.Navigation.changeActiveMenu('Basic');
    }

    /**
     * This function takes button user clicked in a popup window,
     * and chooses correct stream, than closes popup.
     * @param {HTMLElement} el - HTML element clicked by user
     * @property {string} videoIndexStr - stringified index from streamData array
     * @property {number} videoIndex - parsed index from streamData array
     * @property {Object} stream - object containing manifest and streamName fields required by changeVideo function
     */
    function changeVideoHandler(el) {
        var videoIndexStr = el.id.slice(7);
        var videoIndex = parseInt(videoIndexStr, 10);
        var stream;
        if (!Number.isNaN(videoIndex)) {
            stream = streamData[videoIndex];
            changeVideo(stream);
            returnFromPopup();
        } else {
            returnFromPopup();
            logger.error('Something went wrong... This stream can\'t be choosen');
        }
    }

    /**
     * This function changes currently playing video in AVPlayer,
     * into one specified as stream.manifest, also updating data on the screen,
     * to match newly choosen video.
     * @param {Object} stream - object with properites manifest, and stream name
     */
    function changeVideo(stream) {
        player.changeVideo(stream.manifest);
        selectedVideoEl.innerHTML = stream.streamName;
        player.play();
    }


    /**
    * This function takes some (should be) unique, and text to be inputed,
    * and creates button appended to chosen element, making it navigateable
    * @param {*} element - element, on which new button will be appended
    * @param {*} id - hopefully unique id to be given to newly created button
    * @param {*} data - text displayed on the button
    */
    function appendButtonToEl(element, id, data) {
        var newEl = document.createElement('button');

        newEl.textContent = data;
        newEl.setAttribute('id', id);
        newEl.setAttribute('data-list-item', '');

        element.appendChild(newEl);
    }


    /**
    * This function takes streams provided in streamData,
    * and pushes them into popup window, with aproperiete index,
    * so the user will be able to choose which one
    * is suposed to be playing.
    */
    function setStreams() {
        streamData.forEach(function appendStreamToPopup(streamObj, index) {
            appendButtonToEl(videoListEl, 'stream-' + index, streamObj.streamName);
        });
    }


    function registerKeyHandler(keyWithHandler) {
        App.KeyHandler.registerKeyHandler(keyWithHandler.keyCode, keyWithHandler.keyName, keyWithHandler.handler);
    }

    function registerKeyHandlers() {
        var keysWithHandlers = [
            { keyCode: 10252, handler: player.playPause, keyName: 'MediaPlayPause' },
            { keyCode: 415, handler: player.play, keyName: 'MediaPlay' },
            { keyCode: 19, handler: player.pause, keyName: 'MediaPause' },
            { keyCode: 413, handler: player.stop, keyName: 'MediaStop' },
            { keyCode: 417, handler: player.ff, keyName: 'MediaFastForward' },
            { keyCode: 412, handler: player.rew, keyName: 'MediaRewind' },
            { keyCode: 49, handler: player.toggleUhd, keyName: '1' },
            { keyCode: 50, handler: player.getTracks, keyName: '2' },
            { keyCode: 51, handler: player.getProperties, keyName: '3' },
            { keyCode: 10009, handler: onReturn }
        ];

        keysWithHandlers.forEach(registerKeyHandler);
    }

    function addButtonsHandlers() {
        var buttonsWithHandlers = [
            { elementSelector: '.play', handler: player.play },
            { elementSelector: '.pause', handler: player.pause },
            { elementSelector: '.stop', handler: player.stop },
            { elementSelector: '.ff', handler: player.ff },
            { elementSelector: '.rew', handler: player.rew },
            { elementSelector: '.fullscreen', handler: player.toggleFullscreen },
            { elementSelector: '.close', handler: returnFromPopup },
            { elementSelector: '.selected-video', handler: runPopupMenu }
        ];

        App.KeyHandler.addHandlersForButtons(buttonsWithHandlers);

        App.KeyHandler.addHandlerForDelegated('#video-list', changeVideoHandler);
    }

    window.onload = function onload() {
        var playerConfig;
        var loggerContainer = document.querySelector('.logsContainer');
        var playerLogger = App.Logger.create({
            loggerEl: loggerContainer,
            loggerName: 'Player',
            logLevel: App.Logger.logLevels.ALL
        });

        logger = App.Logger.create({
            loggerEl: loggerContainer,
            loggerName: 'Main',
            logLevel: App.Logger.logLevels.ALL
        });


        popupEl = document.querySelector('.popup-box');
        videoListEl = document.querySelector('#video-list');
        selectedVideoEl = document.querySelector('.selected-video');

        registerNavigation();
        setStreams();


        playerConfig = {
            url: 'http://uhd01.iev.vcdn.biz/8k/8K_samsung/75Mb/stream.mpd',
            playerEl: document.querySelector('#av-player'),
            controls: document.querySelector('.buttons'),
            timerEl: document.querySelector('.time'),
            logger: playerLogger,
            set8KMode: true
        };

        // initialize player - loaded from videoPlayer.js
        player = App.VideoPlayer.create(playerConfig);

        registerKeyHandlers();
        addButtonsHandlers();
    };
}());

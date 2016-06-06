import request from 'superagent';
import config from '../config';

class PlayOnTv {

  constructor(configuration) {
    // @TODO detect server automaticaly if possible
    this.host = configuration.host;
    this.port = configuration.port;
    this.endpoints = configuration.endpoints;
  }

  url(endpoint) {
    return `http://${this.host}:${this.port + this.endpoints[endpoint]}`;
  }

  handlePlayOnTVClick(info) {
    const url = info.linkUrl;
    this.getTorrentBinary(
      url,
      (err, res) => {
        // @TODO use file stream directly instead of b64 encoded Blob if possible
        const blob = new Blob([res.xhr.response], { type: 'application/x-bittorrent' });
        this.blobToBase64(blob, (b64Torrent) => this.loadAndPlayTorrent(b64Torrent));
      }
    );
  }

  // Retrieve file at url
  getTorrentBinary(url, callback) {
    const req = request.get(url);
    req.on('request', function () {
      this.xhr.responseType = 'arraybuffer';
    });

    req.end(callback);
  }

  // Convert Blob to base64 using dataUrl
  blobToBase64(blob, callback) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      const base64 = dataUrl.split(',')[1];
      callback(base64);
    };

    reader.readAsDataURL(blob);
  }

  // Send torrent to server to be loaded and played
  loadAndPlayTorrent(b64Torrent) {
    const req = request.post(this.url('load'));
    req.send({ blob: b64Torrent });
    req.end((err) => {
      if (err) throw err;
    });
  }
}

const playOnTv = new PlayOnTv(config);

chrome.contextMenus.onClicked.addListener((info, tab) => playOnTv.handlePlayOnTVClick(info, tab));

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    title: 'Play on TV',
    contexts: ['link'],
    id: 'playOnTvItem',
  });
});

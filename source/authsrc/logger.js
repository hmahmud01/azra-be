const fs = require('fs');

function LogLater(filename, noduplicates, interval) {
    this.filename = filename || 'logs/LOG-'+( new Date().toISOString().slice(0,10) )+'.log';
    this.arr = [];
    this.timeout = false;
    this.interval = interval || 1000;
    this.noduplicates = noduplicates || true;
    this.onsavetimeout_bind = this.onsavetimeout.bind(this);
    this.lasttext = "";
    process.on('exit',()=>{ if(this.timeout)clearTimeout(this.timeout);this.timeout=false; this.save(); })
}

LogLater.prototype = {
    log: function log(text) {
        this.arr.push(text);
        if (!this.timeout) this.timeout = setTimeout(this.onsavetimeout_bind, this.interval);
    },
    text: function log(text, loglastline) {
        if (this.noduplicates) {
            if (this.lasttext === text) return;
            this.lastline = text;
        }
        this._log(text);
    },
    line: function log(text, loglastline) {
        if (this.noduplicates) {
            if (this.lasttext === text) return;
            this.lastline = text;
        }
        this._log(text + '\r\n');
    },
    dateline: function dateline(text) {
        if (this.noduplicates) {
            if (this.lasttext === text) return;
            this.lastline = text;
        }
        this._log(text);
    },
    onsavetimeout: function onsavetimeout() {
        this.timeout = false;
        this.save();
    },
    save: function save() { fs.appendFile(this.filename, this.arr.splice(0, this.arr.length).join(''), function(err) { if (err) console.log(err.stack) }); }
}

module.exports = LogLater;
/*
 * demo-controller.js
 * Copyright (C) 2015 KuoE0 <kuoe0.tw@gmail.com>
 *
 * Distributed under terms of the MIT license.
 */

function debug(msg) {
	var txt = document.getElementById('log').value;
	document.getElementById('log').value = msg + '\n' + txt;
}

(function(exports) {
  'use strict';

  const SLIDE_URL = 'app://demo-slide.gaiamobile.org/index.html';

	function Presenter() {}

	var proto = Presenter.prototype;

	proto.init = function () {
    ['start-btn', 'close-btn', 'prev-btn', 'next-btn'].forEach(function(id) {
      document.getElementById(id).addEventListener('click', this);
    }.bind(this));

    this._request = new window.PresentationRequest(SLIDE_URL);
    this._request.getAvailability().then(
      function(aAvailability) {
        aAvailability.onchange = function() {
          document.getElementById('start-btn').disabled = !aAvailability.value;
          debug("Device available: " + aAvailability.value);
        }
        debug("Device available: " + aAvailability.value);
        document.getElementById('start-btn').disabled = !aAvailability.value;
      },
      function(aError) {
        debug("Error occurred when getting availability: " + aError);
      }
    );
  };

  proto.startSession = function () {
    this._request.start().then(function (session) {
      this._session = session;
			this._session.addEventListener('message', this);
      this._session.onstatechange = this.handleStateChange.bind(this);
    }.bind(this), function () {
      debug('start session rejected');
    }.bind(this));
  };

  proto.closeSession = function () {
    if (this._session) {
      this._session.terminate();
			this._session = null;
    }
  };

  proto.handleEvent = function (evt) {
    switch(evt.type) {
      case 'message':
        var data = JSON.parse(evt.data);
				debug(data);
        break;
      case 'click':
        switch(evt.target.id) {
          case 'start-btn':
						debug("start");
            this.startSession();
            break;
          case 'close-btn':
						debug("close");
            this.closeSession();
            break;
          case 'prev-btn':
						debug("prev");
            this.sendCommand('prev');
            break;
          case 'next-btn':
						debug("next");
            this.sendCommand('next');
            break;
        }
        break;
    }
  };

  proto.handleStateChange = function () {
    if (!this._session || this._session.state != 'connected') {
      this._session = null;
    }
  };

  proto.sendCommand = function (command) {
    var msg = {
      'type': command,
    };
    this._session.send(JSON.stringify(msg));
  };

  exports.Presenter = Presenter;

  window.onload = function() {
    window.presenter = new Presenter();
    window.presenter.init();
  };

})(window);


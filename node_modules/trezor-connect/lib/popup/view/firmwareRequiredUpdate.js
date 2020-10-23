"use strict";

exports.__esModule = true;
exports.firmwareRequiredUpdate = void 0;

var _common = require("./common");

var firmwareRequiredUpdate = function firmwareRequiredUpdate(device) {
  var view = (0, _common.showView)('firmware-update');
  if (!device.features) return;
  if (!device.firmwareRelease) return;
  var release = device.firmwareRelease.release;
  var button = view.getElementsByClassName('confirm')[0];
  var url = release.channel === 'beta' ? 'https://beta-wallet.trezor.io/' : 'https://wallet.trezor.io/';
  var version = release.version.join('.');
  button.setAttribute('href', url + "?fw=" + version);
};

exports.firmwareRequiredUpdate = firmwareRequiredUpdate;
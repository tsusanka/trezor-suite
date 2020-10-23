"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.uploadFirmware = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _builder = require("../../../message/builder");

var _Device = _interopRequireDefault(require("../../../device/Device"));

var UI = _interopRequireWildcard(require("../../../constants/ui"));

var DEVICE = _interopRequireWildcard(require("../../../constants/device"));

// firmware does not send button message but user still must press button to continue
// with fw update.
var postConfirmationMessage = function postConfirmationMessage(device) {
  // only if firmware is already installed. fresh device does not require button confirmation
  if (device.features.firmware_present) {
    device.emit(DEVICE.BUTTON, device, 'ButtonRequest_FirmwareUpdate');
  }
};

var postProgressMessage = function postProgressMessage(device, progress, postMessage) {
  postMessage((0, _builder.UiMessage)(UI.FIRMWARE_PROGRESS, {
    device: device.toMessageObject(),
    progress: progress
  }));
};

var uploadFirmware = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(typedCall, postMessage, device, params) {
    var payload, length, response, start, end, chunk;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            payload = params.payload, length = params.length;
            response = {};

            if (!(device.features.major_version === 1)) {
              _context.next = 12;
              break;
            }

            postConfirmationMessage(device);
            _context.next = 6;
            return typedCall('FirmwareErase', 'Success', {});

          case 6:
            postProgressMessage(device, 0, postMessage);
            _context.next = 9;
            return typedCall('FirmwareUpload', 'Success', {
              payload: payload
            });

          case 9:
            response = _context.sent;
            postProgressMessage(device, 100, postMessage);
            return _context.abrupt("return", response.message);

          case 12:
            if (!(device.features.major_version === 2)) {
              _context.next = 29;
              break;
            }

            postConfirmationMessage(device);
            _context.next = 16;
            return typedCall('FirmwareErase', 'FirmwareRequest', {
              length: length
            });

          case 16:
            response = _context.sent;

          case 17:
            if (!(response.type !== 'Success')) {
              _context.next = 27;
              break;
            }

            start = response.message.offset;
            end = response.message.offset + response.message.length;
            chunk = payload.slice(start, end); // in this moment, device is still displaying 'update firmware dialog', no firmware process is in progress yet

            if (start > 0) {
              postProgressMessage(device, Math.round(start / length * 100), postMessage);
            }

            _context.next = 24;
            return typedCall('FirmwareUpload', 'FirmwareRequest|Success', {
              payload: chunk
            });

          case 24:
            response = _context.sent;
            _context.next = 17;
            break;

          case 27:
            postProgressMessage(device, 100, postMessage);
            return _context.abrupt("return", response.message);

          case 29:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function uploadFirmware(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

exports.uploadFirmware = uploadFirmware;
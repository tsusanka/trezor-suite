"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _AbstractMethod2 = _interopRequireDefault(require("./AbstractMethod"));

var _paramsValidator = require("./helpers/paramsValidator");

var _CoinInfo = require("../../data/CoinInfo");

var _pathUtils = require("../../utils/pathUtils");

var _constants = require("../../constants");

var _builder = require("../../message/builder");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var LiskGetAddress = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(LiskGetAddress, _AbstractMethod);

  function LiskGetAddress(message) {
    var _this;

    _this = _AbstractMethod.call(this, message) || this;
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "confirmed", false);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "progress", 0);
    _this.requiredPermissions = ['read'];
    _this.firmwareRange = (0, _paramsValidator.getFirmwareRange)(_this.name, (0, _CoinInfo.getMiscNetwork)('Lisk'), _this.firmwareRange); // create a bundle with only one batch if bundle doesn't exists

    _this.hasBundle = Object.prototype.hasOwnProperty.call(message.payload, 'bundle');
    var payload = !_this.hasBundle ? _objectSpread(_objectSpread({}, message.payload), {}, {
      bundle: [message.payload]
    }) : message.payload; // validate bundle type

    (0, _paramsValidator.validateParams)(payload, [{
      name: 'bundle',
      type: 'array'
    }, {
      name: 'useEventListener',
      type: 'boolean'
    }]);
    var bundle = [];
    payload.bundle.forEach(function (batch) {
      // validate incoming parameters for each batch
      (0, _paramsValidator.validateParams)(batch, [{
        name: 'path',
        obligatory: true
      }, {
        name: 'address',
        type: 'string'
      }, {
        name: 'showOnTrezor',
        type: 'boolean'
      }]);
      var path = (0, _pathUtils.validatePath)(batch.path, 3);
      var showOnTrezor = true;

      if (Object.prototype.hasOwnProperty.call(batch, 'showOnTrezor')) {
        showOnTrezor = batch.showOnTrezor;
      }

      bundle.push({
        path: path,
        address: batch.address,
        showOnTrezor: showOnTrezor
      });
    });
    var useEventListener = payload.useEventListener && bundle.length === 1 && typeof bundle[0].address === 'string' && bundle[0].showOnTrezor;
    _this.confirmed = useEventListener;
    _this.useUi = !useEventListener;
    _this.params = bundle; // set info

    if (bundle.length === 1) {
      _this.info = "Export Lisk address for account #" + ((0, _pathUtils.fromHardened)(_this.params[0].path[2]) + 1);
    } else {
      _this.info = 'Export multiple Lisk addresses';
    }

    return _this;
  }

  var _proto = LiskGetAddress.prototype;

  _proto.getButtonRequestData = function getButtonRequestData(code) {
    if (code === 'ButtonRequest_Address') {
      var data = {
        type: 'address',
        serializedPath: (0, _pathUtils.getSerializedPath)(this.params[this.progress].path),
        address: this.params[this.progress].address || 'not-set'
      };
      return data;
    }

    return null;
  };

  _proto.confirmation = /*#__PURE__*/function () {
    var _confirmation = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var uiPromise, label, uiResp;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!this.confirmed) {
                _context.next = 2;
                break;
              }

              return _context.abrupt("return", true);

            case 2:
              _context.next = 4;
              return this.getPopupPromise().promise;

            case 4:
              // initialize user response promise
              uiPromise = this.createUiPromise(_constants.UI.RECEIVE_CONFIRMATION, this.device);
              label = this.info; // request confirmation view

              this.postMessage((0, _builder.UiMessage)(_constants.UI.REQUEST_CONFIRMATION, {
                view: 'export-address',
                label: label
              })); // wait for user action

              _context.next = 9;
              return uiPromise.promise;

            case 9:
              uiResp = _context.sent;
              this.confirmed = uiResp.payload;
              return _context.abrupt("return", this.confirmed);

            case 12:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function confirmation() {
      return _confirmation.apply(this, arguments);
    }

    return confirmation;
  }();

  _proto.noBackupConfirmation = /*#__PURE__*/function () {
    var _noBackupConfirmation = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var uiPromise, uiResp;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return this.getPopupPromise().promise;

            case 2:
              // initialize user response promise
              uiPromise = this.createUiPromise(_constants.UI.RECEIVE_CONFIRMATION, this.device); // request confirmation view

              this.postMessage((0, _builder.UiMessage)(_constants.UI.REQUEST_CONFIRMATION, {
                view: 'no-backup'
              })); // wait for user action

              _context2.next = 6;
              return uiPromise.promise;

            case 6:
              uiResp = _context2.sent;
              return _context2.abrupt("return", uiResp.payload);

            case 8:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function noBackupConfirmation() {
      return _noBackupConfirmation.apply(this, arguments);
    }

    return noBackupConfirmation;
  }();

  _proto.run = /*#__PURE__*/function () {
    var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
      var responses, i, batch, silent, response;
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              responses = [];
              i = 0;

            case 2:
              if (!(i < this.params.length)) {
                _context3.next = 23;
                break;
              }

              batch = this.params[i]; // silently get address and compare with requested address
              // or display as default inside popup

              if (!batch.showOnTrezor) {
                _context3.next = 14;
                break;
              }

              _context3.next = 7;
              return this.device.getCommands().liskGetAddress(batch.path, false);

            case 7:
              silent = _context3.sent;

              if (!(typeof batch.address === 'string')) {
                _context3.next = 13;
                break;
              }

              if (!(batch.address !== silent.address)) {
                _context3.next = 11;
                break;
              }

              throw _constants.ERRORS.TypedError('Method_AddressNotMatch');

            case 11:
              _context3.next = 14;
              break;

            case 13:
              batch.address = silent.address;

            case 14:
              _context3.next = 16;
              return this.device.getCommands().liskGetAddress(batch.path, batch.showOnTrezor);

            case 16:
              response = _context3.sent;
              responses.push({
                path: batch.path,
                serializedPath: (0, _pathUtils.getSerializedPath)(batch.path),
                address: response.address
              });

              if (this.hasBundle) {
                // send progress
                this.postMessage((0, _builder.UiMessage)(_constants.UI.BUNDLE_PROGRESS, {
                  progress: i,
                  response: response
                }));
              }

              this.progress++;

            case 20:
              i++;
              _context3.next = 2;
              break;

            case 23:
              return _context3.abrupt("return", this.hasBundle ? responses : responses[0]);

            case 24:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function run() {
      return _run.apply(this, arguments);
    }

    return run;
  }();

  return LiskGetAddress;
}(_AbstractMethod2["default"]);

exports["default"] = LiskGetAddress;
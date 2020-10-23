"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _AbstractMethod2 = _interopRequireDefault(require("./AbstractMethod"));

var _paramsValidator = require("./helpers/paramsValidator");

var _CoinInfo = require("../../data/CoinInfo");

var _pathUtils = require("../../utils/pathUtils");

var _cardanoAddressParameters = require("./helpers/cardanoAddressParameters");

var CardanoSignTransaction = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(CardanoSignTransaction, _AbstractMethod);

  function CardanoSignTransaction(message) {
    var _this;

    _this = _AbstractMethod.call(this, message) || this;
    _this.requiredPermissions = ['read', 'write'];
    _this.firmwareRange = (0, _paramsValidator.getFirmwareRange)(_this.name, (0, _CoinInfo.getMiscNetwork)('Cardano'), _this.firmwareRange);
    _this.info = 'Sign Cardano transaction';
    var payload = message.payload; // validate incoming parameters

    (0, _paramsValidator.validateParams)(payload, [{
      name: 'inputs',
      type: 'array',
      obligatory: true
    }, {
      name: 'outputs',
      type: 'array',
      obligatory: true
    }, {
      name: 'fee',
      type: 'string',
      obligatory: true
    }, {
      name: 'ttl',
      type: 'string',
      obligatory: true
    }, {
      name: 'certificates',
      type: 'array',
      allowEmpty: true
    }, {
      name: 'withdrawals',
      type: 'array',
      allowEmpty: true
    }, {
      name: 'metadata',
      type: 'string'
    }, {
      name: 'protocolMagic',
      type: 'number',
      obligatory: true
    }, {
      name: 'networkId',
      type: 'number',
      obligatory: true
    }]);
    var inputs = payload.inputs.map(function (input) {
      (0, _paramsValidator.validateParams)(input, [{
        name: 'path',
        obligatory: true
      }, {
        name: 'prev_hash',
        type: 'string',
        obligatory: true
      }, {
        name: 'prev_index',
        type: 'number',
        obligatory: true
      }]);
      return {
        address_n: (0, _pathUtils.validatePath)(input.path, 5),
        prev_hash: input.prev_hash,
        prev_index: input.prev_index,
        type: input.type
      };
    });
    var outputs = payload.outputs.map(function (output) {
      (0, _paramsValidator.validateParams)(output, [{
        name: 'address',
        type: 'string'
      }, {
        name: 'amount',
        type: 'amount',
        obligatory: true
      }]);

      if (output.addressParameters) {
        (0, _cardanoAddressParameters.validateAddressParameters)(output.addressParameters);
        return {
          address_parameters: (0, _cardanoAddressParameters.addressParametersToProto)(output.addressParameters),
          amount: output.amount
        };
      } else {
        return {
          address: output.address,
          amount: output.amount
        };
      }
    });
    var certificates = [];

    if (payload.certificates) {
      certificates = payload.certificates.map(function (certificate) {
        (0, _paramsValidator.validateParams)(certificate, [{
          name: 'type',
          type: 'number',
          obligatory: true
        }, {
          name: 'path',
          obligatory: true
        }, {
          name: 'pool',
          type: 'string'
        }]);
        return {
          type: certificate.type,
          path: (0, _pathUtils.validatePath)(certificate.path, 5),
          pool: certificate.pool
        };
      });
    }

    var withdrawals = [];

    if (payload.withdrawals) {
      withdrawals = payload.withdrawals.map(function (withdrawal) {
        (0, _paramsValidator.validateParams)(withdrawal, [{
          name: 'path',
          obligatory: true
        }, {
          name: 'amount',
          type: 'amount',
          obligatory: true
        }]);
        return {
          path: (0, _pathUtils.validatePath)(withdrawal.path, 5),
          amount: withdrawal.amount
        };
      });
    }

    _this.params = {
      inputs: inputs,
      outputs: outputs,
      fee: payload.fee,
      ttl: payload.ttl,
      certificates: certificates,
      withdrawals: withdrawals,
      metadata: payload.metadata,
      protocolMagic: payload.protocolMagic,
      networkId: payload.networkId
    };
    return _this;
  }

  var _proto = CardanoSignTransaction.prototype;

  _proto.run = /*#__PURE__*/function () {
    var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var response;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return this.device.getCommands().cardanoSignTx(this.params.inputs, this.params.outputs, this.params.fee, this.params.ttl, this.params.certificates, this.params.withdrawals, this.params.metadata, this.params.protocolMagic, this.params.networkId);

            case 2:
              response = _context.sent;
              return _context.abrupt("return", {
                hash: response.tx_hash,
                serializedTx: response.serialized_tx
              });

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function run() {
      return _run.apply(this, arguments);
    }

    return run;
  }();

  return CardanoSignTransaction;
}(_AbstractMethod2["default"]);

exports["default"] = CardanoSignTransaction;
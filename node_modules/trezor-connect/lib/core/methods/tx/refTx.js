"use strict";

exports.__esModule = true;
exports.transformReferencedTransactions = exports.getReferencedTransactions = void 0;

var _utxoLib = require("@trezor/utxo-lib");

var _bufferUtils = require("../../../utils/bufferUtils");

// local modules
// Get array of unique referenced transactions ids
var getReferencedTransactions = function getReferencedTransactions(inputs) {
  return inputs.reduce(function (result, utxo) {
    var hash = (0, _bufferUtils.reverseBuffer)(utxo.hash).toString('hex');
    if (result.includes(hash)) return result;
    return result.concat(hash);
  }, []);
}; // Transform referenced transactions from Bitcore to Trezor format


exports.getReferencedTransactions = getReferencedTransactions;

var transformReferencedTransactions = function transformReferencedTransactions(txs) {
  return txs.map(function (tx) {
    var extraData = tx.getExtraData();
    var version_group_id = _utxoLib.coins.isZcashType(tx.network) && typeof tx.versionGroupId === 'number' && tx.version >= 3 ? tx.versionGroupId : null;
    return {
      version: tx.isDashSpecialTransaction() ? tx.version | tx.type << 16 : tx.version,
      hash: tx.getId(),
      inputs: tx.ins.map(function (input) {
        return {
          prev_index: input.index,
          sequence: input.sequence,
          prev_hash: (0, _bufferUtils.reverseBuffer)(input.hash).toString('hex'),
          script_sig: input.script.toString('hex')
        };
      }),
      bin_outputs: tx.outs.map(function (output) {
        return {
          amount: typeof output.value === 'number' ? output.value.toString() : output.value,
          script_pubkey: output.script.toString('hex')
        };
      }),
      extra_data: extraData ? extraData.toString('hex') : null,
      lock_time: tx.locktime,
      timestamp: tx.timestamp,
      version_group_id: version_group_id,
      expiry: tx.expiryHeight
    };
  });
};

exports.transformReferencedTransactions = transformReferencedTransactions;
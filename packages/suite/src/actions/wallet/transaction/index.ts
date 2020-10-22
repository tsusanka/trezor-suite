import { formatNetworkAmount, formatAmount } from '@wallet-utils/accountUtils';
import TrezorConnect from 'trezor-connect';
import { COINMARKET_EXCHANGE } from '../constants';
import BigNumber from 'bignumber.js';
import { ComposeTransactionData, SignedTx } from '@wallet-types/transaction';
import { GetState, Dispatch } from '@suite-types';
import * as accountActions from '@wallet-actions/accountActions';
import * as notificationActions from '@suite-actions/notificationActions';
import * as transactionBitcoinActions from './transactionBitcoinActions';
import * as transactionEthereumActions from './transactionEthereumActions';
import * as transactionRippleActions from './transactionRippleActions';
import * as modalActions from '@suite-actions/modalActions';
import { PrecomposedTransactionFinal } from '@suite/types/wallet/sendForm';

export const composeTransaction = (composeTransactionData: ComposeTransactionData) => async (
    dispatch: Dispatch,
) => {
    const {
        account: { networkType },
    } = composeTransactionData;

    if (networkType === 'bitcoin') {
        return dispatch(transactionBitcoinActions.composeTransaction(composeTransactionData));
    }

    if (networkType === 'ethereum') {
        return dispatch(transactionEthereumActions.composeTransaction(composeTransactionData));
    }

    if (networkType === 'ripple') {
        return dispatch(transactionRippleActions.composeTransaction(composeTransactionData));
    }
};

// this should be refactored - remove dependency for COINMARKET_EXCHANGE
export const cancelSignTx = (signedTx: SignedTx) => (dispatch: Dispatch) => {
    dispatch({ type: COINMARKET_EXCHANGE.REQUEST_SIGN_TRANSACTION });
    dispatch({ type: COINMARKET_EXCHANGE.REQUEST_PUSH_TRANSACTION });
    // if transaction is not signed yet interrupt signing in TrezorConnect
    if (!signedTx) {
        TrezorConnect.cancel('tx-cancelled');
        return;
    }
    // otherwise just close modal
    dispatch(modalActions.onCancel());
};

export const pushTransaction = (
    signedTx: SignedTx,
    transactionInfo: PrecomposedTransactionFinal,
) => async (dispatch: Dispatch, getState: GetState) => {
    const { account } = getState().wallet.selectedAccount;
    const { device } = getState().suite;

    if (!signedTx || !transactionInfo || !account) return false;

    const sentTx = await TrezorConnect.pushTransaction(signedTx);
    // const sentTx = { success: true, payload: { txid: 'ABC ' } };
    // close modal regardless result
    dispatch(cancelSignTx(signedTx));

    const { token } = transactionInfo;
    const spentWithoutFee = !token
        ? new BigNumber(transactionInfo.totalSpent).minus(transactionInfo.fee).toString()
        : '0';
    // get total amount without fee OR token amount
    const formattedAmount = token
        ? `${formatAmount(
              transactionInfo.totalSpent,
              token.decimals,
          )} ${token.symbol!.toUpperCase()}`
        : formatNetworkAmount(spentWithoutFee, account.symbol, true);

    if (sentTx.success) {
        dispatch(
            notificationActions.addToast({
                type: 'tx-sent',
                formattedAmount,
                device,
                descriptor: account.descriptor,
                symbol: account.symbol,
                txid: sentTx.payload.txid,
            }),
        );

        dispatch(accountActions.fetchAndUpdateAccount(account));
    } else {
        dispatch(
            notificationActions.addToast({ type: 'sign-tx-error', error: sentTx.payload.error }),
        );
    }

    return sentTx.success;
};

import { ExternalOutput } from '@wallet-types/sendForm';
import { amountToSatoshi, networkAmountToSatoshi } from '@wallet-utils/accountUtils';
import { findToken } from '@wallet-utils/sendFormUtils';
import { ComposeOutput } from 'trezor-connect';
import { ComposeTransactionData } from '@wallet-actions/coinmarketExchangeActions';

export const getExternalComposeOutput = ({
    account,
    network,
    address,
    amount,
    token,
    isMaxActive,
}: ComposeTransactionData) => {
    if (!isMaxActive && !amount) return; // incomplete Output

    const tokenInfo = findToken(account.tokens, token);
    const decimals = tokenInfo ? tokenInfo.decimals : network.decimals;
    const amountInSatoshi = amountToSatoshi(amount, decimals);

    let output: ExternalOutput;
    if (isMaxActive) {
        if (address) {
            output = {
                type: 'send-max',
                address,
            };
        } else {
            output = {
                type: 'send-max-noaddress',
            };
        }
    } else if (address) {
        output = {
            type: 'external',
            address,
            amount: amountInSatoshi,
        };
    } else {
        output = {
            type: 'noaddress',
            amount: amountInSatoshi,
        };
    }

    return {
        output,
        tokenInfo,
        decimals,
    };
};

export const getBitcoinComposeOutputs = ({
    account,
    address,
    amount,
    isMaxActive,
}: ComposeTransactionData) => {
    const result: ComposeOutput[] = [];

    if (isMaxActive) {
        if (address) {
            result.push({
                type: 'send-max',
                address,
            });
        } else {
            result.push({ type: 'send-max-noaddress' });
        }
    } else if (amount) {
        const formattedAmount = networkAmountToSatoshi(amount, account.symbol);
        if (address) {
            result.push({
                type: 'external',
                address,
                amount: formattedAmount,
            });
        } else {
            result.push({
                type: 'noaddress',
                amount: formattedAmount,
            });
        }
    }

    return result;
};

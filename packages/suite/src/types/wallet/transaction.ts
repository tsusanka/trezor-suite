import { FeeLevel } from 'trezor-connect';
import { FeeInfo, PrecomposedTransactionFinal } from '@wallet-types/sendForm';
import { Network, Account } from '@wallet-types';

export interface SignTransactionData {
    account: Account;
    address: string;
    amount: string;
    network: Network;
    rippleDestinationTag?: string;
    transactionInfo: PrecomposedTransactionFinal | null;
    modalName: 'coinmarket-review-transaction';
}

export interface ComposeTransactionData {
    account: Account;
    amount: string;
    feeInfo: FeeInfo;
    feePerUnit: string;
    feeLimit: string;
    network: Network;
    selectedFee: FeeLevel['label'];
    isMaxActive: boolean;
    address?: string;
    token?: string;
    ethereumDataHex?: string;
}

export interface SignedTx {
    tx: string;
    coin: string;
}

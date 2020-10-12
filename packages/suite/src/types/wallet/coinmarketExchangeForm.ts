import { AppState } from '@suite-types';
import { UseFormMethods } from 'react-hook-form';
import { Account, Network } from '@wallet-types';
import { FeeLevel } from 'trezor-connect';
import { ExchangeTrade, ExchangeTradeQuoteRequest } from 'invity-api';
import { ExchangeInfo } from '@wallet-actions/coinmarketExchangeActions';
import { TypedValidationRules } from './form';
import { FeeInfo } from '@wallet-types/sendForm';

export type Option = { value: string; label: string };
export type defaultCountryOption = { value: string; label?: string };

export interface ComponentProps {
    selectedAccount: AppState['wallet']['selectedAccount'];
    fiat: AppState['wallet']['fiat'];
    localCurrency: AppState['wallet']['settings']['localCurrency'];
    fees: AppState['wallet']['fees'];
    quotesRequest: AppState['wallet']['coinmarket']['exchange']['quotesRequest'];
}

export type ButtonTypes = 'max' | 'half' | 'quarter';

export interface Props extends ComponentProps {
    selectedAccount: Extract<ComponentProps['selectedAccount'], { status: 'loaded' }>;
}

export type FormState = {
    buyCryptoInput?: string;
    buyCryptoSelect: Option;
    fiatInput?: string;
    fiatSelectL?: Option;
    sellCryptoSelect: Option;
    feePerUnit?: string;
};

export interface AmountLimits {
    currency: string;
    min?: number;
    max?: number;
}

export type ExchangeFormContextValues = Omit<UseFormMethods<FormState>, 'register'> & {
    register: (rules?: TypedValidationRules) => (ref: any) => void;
    onSubmit: () => void;
    account: Account;
    exchangeInfo?: ExchangeInfo;
    localCurrencyOption: { label: string; value: string };
    selectedFee: FeeLevel['label'];
    selectFee: (feeLevel: FeeLevel['label']) => void;
    composeTransaction: () => void;
    updateFiatCurrency: (selectedCurrency: { value: string; label: string }) => void;
    updateBuyCryptoValue: (fiatValue: string, decimals: number) => void;
    saveQuoteRequest: (request: ExchangeTradeQuoteRequest) => Promise<void>;
    saveQuotes: (fixedQuotes: ExchangeTrade[], floatQuotes: ExchangeTrade[]) => Promise<void>;
    saveTrade: (exchangeTrade: ExchangeTrade, account: Account, date: string) => Promise<void>;
    amountLimits?: AmountLimits;
    setAmountLimits: (limits?: AmountLimits) => void;
    quotesRequest: AppState['wallet']['coinmarket']['exchange']['quotesRequest'];
    isLoading: boolean;
    updateFiatValue: (amount: string) => void;
    noProviders: boolean;
    network: Network;
    fillValue: (type: ButtonTypes) => void;
    feeInfo: FeeInfo;
    fiat: AppState['wallet']['fiat'];
    localCurrency: { value: string; label: string };
    fees: AppState['wallet']['fees'];
};

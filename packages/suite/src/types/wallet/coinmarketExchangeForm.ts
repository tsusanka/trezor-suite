import { AppState } from '@suite-types';
import { FieldError, UseFormMethods } from 'react-hook-form';
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

export interface Props extends ComponentProps {
    selectedAccount: Extract<ComponentProps['selectedAccount'], { status: 'loaded' }>;
}

export type FormState = {
    cryptoInput?: string;
    sellCryptoSelect: Option;
    buyCryptoSelect: Option;
};

export interface AmountLimits {
    currency: string;
    min?: number;
    max?: number;
}

export type ExchangeFormContextValues = Omit<UseFormMethods<FormState>, 'register'> & {
    register: (rules?: TypedValidationRules) => (ref: any) => void; // TODO: ReturnType of UseFormMethods['register'] union
    onSubmit: () => void;
    account: Account;
    exchangeInfo?: ExchangeInfo;
    changeFeeLevel: (currentLevel: FeeLevel, newLevel: FeeLevel) => FieldError | void;
    saveQuoteRequest: (request: ExchangeTradeQuoteRequest) => Promise<void>;
    saveQuotes: (fixedQuotes: ExchangeTrade[], floatQuotes: ExchangeTrade[]) => Promise<void>;
    saveTrade: (exchangeTrade: ExchangeTrade, account: Account, date: string) => Promise<void>;
    amountLimits?: AmountLimits;
    setAmountLimits: (limits?: AmountLimits) => void;
    quotesRequest: AppState['wallet']['coinmarket']['exchange']['quotesRequest'];
    isLoading: boolean;
    noProviders: boolean;
    network: Network;
    feeInfo: FeeInfo;
    fiat: AppState['wallet']['fiat'];
    localCurrency: { value: string; label: string };
    fees: AppState['wallet']['fees'];
};

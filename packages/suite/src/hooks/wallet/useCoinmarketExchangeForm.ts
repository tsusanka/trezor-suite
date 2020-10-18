import { createContext, useContext, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FeeLevel } from 'trezor-connect';
import { toFiatCurrency, fromFiatCurrency } from '@wallet-utils/fiatConverterUtils';
import { getFeeLevels } from '@wallet-utils/sendFormUtils';
import { PrecomposedLevels, PrecomposedTransaction } from '@wallet-types/sendForm';
import { useInvityAPI } from '@wallet-hooks/useCoinmarket';
import * as coinmarketExchangeActions from '@wallet-actions/coinmarketExchangeActions';
import { useActions } from '@suite-hooks';
import Bignumber from 'bignumber.js';
import invityAPI from '@suite-services/invityAPI';
import * as routerActions from '@suite-actions/routerActions';
import {
    FormState,
    Props,
    ComposeData,
    AmountLimits,
    ExchangeFormContextValues,
} from '@wallet-types/coinmarketExchangeForm';
import {
    getAmountLimits,
    splitToFixedFloatQuotes,
} from '@suite/utils/wallet/coinmarket/exchangeUtils';
import { ExchangeTradeQuoteRequest } from 'invity-api';

export const ExchangeFormContext = createContext<ExchangeFormContextValues | null>(null);
ExchangeFormContext.displayName = 'CoinmarketExchangeContext';

export const useCoinmarketExchangeForm = (props: Props): ExchangeFormContextValues => {
    const { exchangeInfo } = useInvityAPI();
    const { selectedAccount, quotesRequest, fees, fiat, localCurrency, exchangeCoinInfo } = props;
    const { account, network } = selectedAccount;
    const { symbol, networkType } = account;
    const coinFees = fees[symbol];
    const levels = getFeeLevels(networkType, coinFees);
    const feeInfo = { ...coinFees, levels };
    const fiatRates = fiat.coins.find(item => item.symbol === symbol);
    const localCurrencyOption = { value: localCurrency, label: localCurrency.toUpperCase() };
    const methods = useForm<FormState>({ mode: 'onChange' });
    const { register, setValue, getValues } = methods;
    const [amountLimits, setAmountLimits] = useState<AmountLimits | undefined>(undefined);
    const [activeMaxLimit, setActiveMaxLimit] = useState<number | undefined>(undefined);
    const [transactionInfo, setTransactionInfo] = useState<null | PrecomposedTransaction>(null);
    const [selectedFee, selectFee] = useState<FeeLevel['label']>('normal');
    const {
        saveQuoteRequest,
        saveQuotes,
        saveTrade,
        composeTransaction,
        saveTransactionInfo,
    } = useActions({
        saveQuoteRequest: coinmarketExchangeActions.saveQuoteRequest,
        saveQuotes: coinmarketExchangeActions.saveQuotes,
        saveTrade: coinmarketExchangeActions.saveTrade,
        composeTransaction: coinmarketExchangeActions.composeTransaction,
        saveTransactionInfo: coinmarketExchangeActions.saveTransactionInfo,
    });

    const { goto } = useActions({ goto: routerActions.goto });

    const onSubmit = async () => {
        const formValues = methods.getValues();
        const sendStringAmount = formValues.buyCryptoInput || '';
        const send = formValues.buyCryptoSelect.value;
        const receive = formValues.sellCryptoSelect.value;
        const request: ExchangeTradeQuoteRequest = {
            receive,
            send,
            sendStringAmount,
        };

        await saveQuoteRequest(request);
        const allQuotes = await invityAPI.getExchangeQuotes(request);
        const limits = getAmountLimits(allQuotes);

        if (limits) {
            setAmountLimits(limits);
        } else {
            const [fixedQuotes, floatQuotes] = splitToFixedFloatQuotes(allQuotes, exchangeInfo);
            await saveQuotes(fixedQuotes, floatQuotes);
            goto('wallet-coinmarket-exchange-offers', {
                symbol: account.symbol,
                accountIndex: account.index,
                accountType: account.accountType,
            });
        }
    };

    const compose = async (data: ComposeData) => {
        const formValues = getValues();
        const feeLevel = feeInfo.levels.find(
            level => (level.label === data && data.feeLevelLabel) || selectedFee,
        );

        if (!feeLevel) return null;

        const result: PrecomposedLevels | undefined = await composeTransaction({
            account,
            amount: formValues.buyCryptoInput || '0',
            feeInfo,
            feePerUnit: data ? data.feePerUnit || '0' : feeLevel.feePerUnit,
            feeLimit: feeLevel.feeLimit || '0',
            network,
            selectedFee,
            isMaxActive: data ? typeof data.activeMaxLimit === 'number' : false,
            address: '',
            token:
                formValues.buyCryptoSelect.value === 'ETH'
                    ? undefined
                    : formValues.buyCryptoSelect.value,
        });

        if (!result || result[selectedFee].type === 'error') {
            return;
        }
        const transactionInfo = result[selectedFee];
        if (
            data &&
            result &&
            data.activeMaxLimit &&
            transactionInfo &&
            transactionInfo.type !== 'error'
        ) {
            const transactionInfo = result[selectedFee];
            if (transactionInfo && transactionInfo.type !== 'error') {
                const amountToFill = new Bignumber(transactionInfo.max || '0').dividedBy(
                    data.activeMaxLimit || '1',
                );
                if (amountToFill) {
                    setValue('buyCryptoInput', amountToFill.toFixed(network.decimals));
                }
                setTransactionInfo(transactionInfo);
                saveTransactionInfo(transactionInfo);
            }
        }
    };

    const updateFiatValue = (amount: string) => {
        const currency: { value: string; label: string } = getValues('fiatSelect');
        if (!fiatRates || !fiatRates.current || !currency) return;
        const fiatValue = toFiatCurrency(amount, currency.value, fiatRates.current.rates);
        if (fiatValue) {
            setValue('fiatInput', fiatValue, { shouldValidate: true });
        }
    };

    const updateFiatCurrency = (currency: { label: string; value: string }) => {
        const amount = getValues('buyCryptoInput') || '0';
        if (!fiatRates || !fiatRates.current || !currency) return;
        const fiatValue = toFiatCurrency(amount, currency.value, fiatRates.current.rates);
        if (fiatValue) {
            setValue('fiatInput', fiatValue, { shouldValidate: true });
        }
    };

    const updateBuyCryptoValue = (amount: string, decimals: number) => {
        const currency: { value: string; label: string } = getValues('fiatSelect');
        if (!fiatRates || !fiatRates.current || !currency) return;
        const cryptoValue = fromFiatCurrency(
            amount,
            currency.value,
            fiatRates.current.rates,
            decimals,
        );

        if (cryptoValue) {
            setValue('buyCryptoInput', cryptoValue, { shouldValidate: true });
        }
    };
    // const formValues = getValues();
    const token = undefined;
    // formValues.buyCryptoSelect?.value === 'ETH' || !formValues.buyCryptoSelect.value
    //     ? undefined
    //     : formValues.buyCryptoSelect.value;
    const typedRegister = useCallback(<T>(rules?: T) => register(rules), [register]);
    const isLoading = !exchangeInfo?.exchangeList || exchangeInfo?.exchangeList.length === 0;
    const noProviders =
        exchangeInfo?.exchangeList?.length === 0 || !exchangeInfo?.sellSymbols.has(account.symbol);

    return {
        ...methods,
        account,
        onSubmit,
        updateFiatValue,
        register: typedRegister,
        exchangeInfo,
        saveQuoteRequest,
        activeMaxLimit,
        setActiveMaxLimit,
        saveQuotes,
        quotesRequest,
        transactionInfo,
        localCurrencyOption,
        exchangeCoinInfo,
        selectedFee,
        updateFiatCurrency,
        selectFee,
        token,
        updateBuyCryptoValue,
        saveTrade,
        feeInfo,
        compose,
        setTransactionInfo,
        fiatRates,
        amountLimits,
        setAmountLimits,
        isLoading,
        noProviders,
        network,
    };
};

export const useCoinmarketExchangeFormContext = () => {
    const context = useContext(ExchangeFormContext);
    if (context === null) throw Error('ExchangeFormContext used without Context');
    return context;
};

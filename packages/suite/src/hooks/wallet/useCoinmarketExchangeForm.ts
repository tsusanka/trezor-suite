import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FeeLevel } from 'trezor-connect';
import { getFeeLevels } from '@wallet-utils/sendFormUtils';
import { useInvityAPI } from '@wallet-hooks/useCoinmarket';
import * as coinmarketExchangeActions from '@wallet-actions/coinmarketExchangeActions';
import { useActions } from '@suite-hooks';
import invityAPI from '@suite-services/invityAPI';
import * as routerActions from '@suite-actions/routerActions';
import {
    FormState,
    Props,
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
    const { selectedAccount, quotesRequest, fees, fiat, localCurrency } = props;
    const { account, network } = selectedAccount;
    const { symbol, networkType } = account;
    const coinFees = fees[symbol];
    const levels = getFeeLevels(networkType, coinFees);
    const feeInfo = { ...coinFees, levels };
    const fiatRates = fiat.coins.find(item => item.symbol === symbol);
    const localCurrencyOption = { value: localCurrency, label: localCurrency.toUpperCase() };
    const methods = useForm<FormState>({ mode: 'onChange' });
    const { register, setValue, clearErrors, errors } = methods;

    useEffect(() => {
        register({ name: 'selectedFee', type: 'custom' });
    }, [register]);

    const [amountLimits, setAmountLimits] = useState<AmountLimits | undefined>(undefined);

    const { saveQuoteRequest, saveQuotes, saveTrade } = useActions({
        saveQuoteRequest: coinmarketExchangeActions.saveQuoteRequest,
        saveQuotes: coinmarketExchangeActions.saveQuotes,
        saveTrade: coinmarketExchangeActions.saveTrade,
    });

    const { goto } = useActions({
        goto: routerActions.goto,
    });

    const onSubmit = async () => {
        const formValues = methods.getValues();
        const sendStringAmount = formValues.cryptoInput || '';
        const send = formValues.sellCryptoSelect.value;
        const receive = formValues.buyCryptoSelect.value;
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

    const changeFeeLevel = useCallback(
        (currentLevel: FeeLevel, newLevel: FeeLevel) => {
            if (currentLevel.label === newLevel.label) return;
            setValue('selectedFee', newLevel.label);
            const isCustom = newLevel.label === 'custom';
            // catch first change to custom
            if (isCustom) {
                setValue('feePerUnit', currentLevel.feePerUnit);
                setValue('feeLimit', currentLevel.feeLimit);
            } else {
                // when switching from custom FeeLevel which has an error
                // this error should be cleared and transaction should be precomposed again
                // response is handled and used in @wallet-views/send/components/Fees (the caller of this function)
                const shouldCompose = errors.feePerUnit || errors.feeLimit;
                if (shouldCompose) {
                    clearErrors(['feePerUnit', 'feeLimit']);
                }
                setValue('feePerUnit', '');
                setValue('feeLimit', '');

                return shouldCompose;
            }
        },
        [setValue, errors, clearErrors],
    );

    const typedRegister = useCallback(<T>(rules?: T) => register(rules), [register]);
    const isLoading = !exchangeInfo?.exchangeList || exchangeInfo?.exchangeList.length === 0;
    const noProviders =
        exchangeInfo?.exchangeList?.length === 0 || !exchangeInfo?.sellSymbols.has(account.symbol);

    return {
        ...methods,
        account,
        onSubmit,
        changeFeeLevel,
        register: typedRegister,
        exchangeInfo,
        saveQuoteRequest,
        saveQuotes,
        quotesRequest,
        saveTrade,
        feeInfo,
        localCurrencyOption,
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

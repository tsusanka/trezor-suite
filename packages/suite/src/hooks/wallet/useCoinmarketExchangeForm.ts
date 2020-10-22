import { createContext, useContext, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import TrezorConnect, { FeeLevel } from 'trezor-connect';
import { toFiatCurrency, fromFiatCurrency } from '@wallet-utils/fiatConverterUtils';
import { getFeeLevels } from '@wallet-utils/sendFormUtils';
import { PrecomposedLevels, PrecomposedTransactionFinal } from '@wallet-types/sendForm';
import { useInvityAPI } from '@wallet-hooks/useCoinmarket';
import * as coinmarketExchangeActions from '@wallet-actions/coinmarketExchangeActions';
import * as transactionActions from '@wallet-actions/transaction';
import { useActions } from '@suite-hooks';
import BigNumber from 'bignumber.js';
import { NETWORKS } from '@wallet-config';
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
    const {
        selectedAccount,
        quotesRequest,
        fees,
        fiat,
        localCurrency,
        exchangeCoinInfo,
        device,
    } = props;
    const { account, network } = selectedAccount;
    const { symbol, networkType } = account;
    const coinFees = fees[symbol];
    const levels = getFeeLevels(networkType, coinFees);
    const feeInfo = { ...coinFees, levels };
    const fiatRates = fiat.coins.find(item => item.symbol === symbol);
    const localCurrencyOption = { value: localCurrency, label: localCurrency.toUpperCase() };
    const methods = useForm<FormState>({ mode: 'onChange' });
    const { register, setValue, getValues, setError } = methods;
    const [token, setToken] = useState<string | undefined>(getValues('buyCryptoSelect')?.value);
    const [amountLimits, setAmountLimits] = useState<AmountLimits | undefined>(undefined);
    const [setMax, setSetMax] = useState<boolean | undefined>(undefined);
    const [isComposing, setIsComposing] = useState<boolean>(false);
    const [transactionInfo, setTransactionInfo] = useState<null | PrecomposedTransactionFinal>(
        null,
    );
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
        composeTransaction: transactionActions.composeTransaction,
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
            // if (transactionInfo) {
            //     const address =
            //         transactionInfo.transaction.outputs.find(o => o.address)?.address || '';
            //     await signTransaction({
            //         account,
            //         address,
            //         transactionInfo,
            //         network,
            //         amount: transactionInfo.totalSpent,
            //         modalName: 'coinmarket-exchange-form',
            //     });

            //     return;
            // }
            goto('wallet-coinmarket-exchange-offers', {
                symbol: account.symbol,
                accountIndex: account.index,
                accountType: account.accountType,
            });
        }
    };

    const updateFiatValue = (amount: string) => {
        const currency: { value: string; label: string } | undefined = getValues('fiatSelect');
        if (!fiatRates || !fiatRates.current || !currency) return;
        const fiatValue = toFiatCurrency(amount, currency.value, fiatRates.current.rates);
        if (fiatValue) {
            setValue('fiatInput', fiatValue, { shouldValidate: true });
        }
    };

    const getComposeAddressPlaceholder = async () => {
        // the address is later replaced by the address of the exchange
        // as a precaution, use user's own address as a placeholder
        const { networkType } = account;
        switch (networkType) {
            case 'bitcoin': {
                // use legacy (the most expensive) address for fee calculation
                // as we do not know what address type the exchange will use
                const legacy =
                    NETWORKS.find(
                        network =>
                            network.symbol === account.symbol && network.accountType === 'legacy',
                    ) ||
                    NETWORKS.find(
                        network =>
                            network.symbol === account.symbol && network.accountType === 'segwit',
                    ) ||
                    network;
                if (legacy && device) {
                    const result = await TrezorConnect.getAddress({
                        device,
                        coin: legacy.symbol,
                        path: `${legacy.bip44.replace('i', '0')}/0/0`,
                        useEmptyPassphrase: device.useEmptyPassphrase,
                        showOnTrezor: false,
                    });
                    if (result.success) {
                        return result.payload.address;
                    }
                }
                // as a fallback, use the change address of current account
                return account.addresses?.change[0].address;
            }
            case 'ethereum':
            case 'ripple':
                return account.descriptor;
            // no default
        }
    };

    const compose = async (data: ComposeData) => {
        setIsComposing(true);
        const formValues = getValues();
        const feeLevel = feeInfo.levels.find(level => level.label === data.feeLevelLabel);
        const selectedFeeLevel =
            feeLevel || feeInfo.levels.find(level => level.label === selectedFee);

        if (!selectedFeeLevel) return null;
        const placeholderAddress = await getComposeAddressPlaceholder();
        const result: PrecomposedLevels | undefined = await composeTransaction({
            account,
            amount: data && data.amount ? data.amount : formValues.buyCryptoInput || '0',
            feeInfo,
            feePerUnit:
                data && data.feePerUnit ? data.feePerUnit || '0' : selectedFeeLevel.feePerUnit,
            feeLimit:
                data && data.feeLimit ? data.feeLimit || '0' : selectedFeeLevel.feeLimit || '0',
            network,
            selectedFee,
            isMaxActive: data && data.setMax ? data.setMax || false : false,
            address: placeholderAddress,
            token,
        });

        const transactionInfo = result ? result[selectedFeeLevel.label] : null;
        if (transactionInfo?.type === 'final') {
            setTransactionInfo(transactionInfo);
            if (data.fillValue) {
                let amountToFill = data.amount || '0';
                if (data.setMax) {
                    amountToFill = new BigNumber(transactionInfo.max || '0').toFixed(
                        network.decimals,
                    );
                }
                setValue('buyCryptoInput', amountToFill, { shouldValidate: true });
                updateFiatValue(amountToFill);
            }

            saveTransactionInfo(transactionInfo);
        }

        if (transactionInfo?.type === 'error') {
            setError('buyCryptoInput', {
                type: 'compose',
                message: transactionInfo.error.toLowerCase(),
            });
        }

        setIsComposing(false);
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
        const currency: { value: string; label: string } | undefined = getValues('fiatSelect');
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
        isMax: setMax || false,
        setToken,
        saveQuoteRequest,
        setMax: setSetMax,
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
        isComposing,
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

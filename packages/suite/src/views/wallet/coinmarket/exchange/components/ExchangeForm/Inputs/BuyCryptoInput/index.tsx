import { Input } from '@trezor/components';
import React from 'react';
import { formatNetworkAmount } from '@wallet-utils/accountUtils';
import { FIAT } from '@suite-config';
import styled from 'styled-components';
import { isDecimalsValid, isInteger } from '@wallet-utils/validation';
import { useCoinmarketExchangeFormContext } from '@wallet-hooks/useCoinmarketExchangeForm';
import { Translation } from '@suite-components';
import BuyCryptoSelect from './BuyCryptoSelect';
import { InputError } from '@wallet-components';
import Bignumber from 'bignumber.js';
import { formatCryptoAmount } from '@wallet-utils/coinmarket/coinmarketUtils';

export const buildCurrencyOptions = () => {
    const result: { value: string; label: string }[] = [];
    FIAT.currencies.forEach(currency =>
        result.push({ value: currency, label: currency.toUpperCase() }),
    );
    return result;
};

const StyledInput = styled(Input)`
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
`;

const BuyCryptoInput = () => {
    const {
        register,
        errors,
        clearErrors,
        trigger,
        network,
        account,
        amountLimits,
        compose,
        token,
        setMax,
        updateFiatValue,
        setValue,
    } = useCoinmarketExchangeFormContext();
    const buyCryptoInput = 'buyCryptoInput';
    const fiatInput = 'fiatInput';
    const { symbol, tokens } = account;
    const tokenData = tokens?.find(t => t.symbol === token);
    const formattedAvailableBalance = tokenData
        ? tokenData.balance || '0'
        : formatNetworkAmount(account.availableBalance, account.symbol);
    const reserve =
        account.networkType === 'ripple'
            ? formatNetworkAmount(account.misc.reserve, account.symbol)
            : undefined;
    const decimals = tokenData ? tokenData.decimals : network.decimals;

    return (
        <StyledInput
            onFocus={() => {
                setValue(fiatInput, '');
                clearErrors(fiatInput);
                trigger([buyCryptoInput]);
            }}
            onChange={async event => {
                updateFiatValue(event.target.value);
                clearErrors(fiatInput);
                setMax(false);
                compose({
                    setMax: false,
                    amount: event.target.value,
                });
            }}
            state={errors[buyCryptoInput] ? 'error' : undefined}
            name={buyCryptoInput}
            noTopLabel
            innerRef={register({
                validate: (value: string) => {
                    const amountBig = new Bignumber(value);
                    if (value) {
                        if (amountBig.isNaN()) {
                            return 'AMOUNT_IS_NOT_NUMBER';
                        }

                        if (amountBig.lt(0)) {
                            return 'AMOUNT_IS_TOO_LOW';
                        }

                        if (amountLimits) {
                            const amount = Number(value);
                            if (amountLimits.min && amount < amountLimits.min) {
                                return (
                                    <Translation
                                        id="TR_EXCHANGE_VALIDATION_ERROR_MINIMUM_CRYPTO"
                                        values={{
                                            minimum: formatCryptoAmount(amountLimits.min),
                                            currency: amountLimits.currency,
                                        }}
                                    />
                                );
                            }

                            if (amountLimits.max && amount > amountLimits.max) {
                                return (
                                    <Translation
                                        id="TR_EXCHANGE_VALIDATION_ERROR_MAXIMUM_CRYPTO"
                                        values={{
                                            maximum: formatCryptoAmount(amountLimits.max),
                                            currency: amountLimits.currency,
                                        }}
                                    />
                                );
                            }
                        }

                        if (amountBig.gt(formattedAvailableBalance)) {
                            if (
                                reserve &&
                                amountBig.lt(formatNetworkAmount(account.balance, symbol))
                            ) {
                                return (
                                    <Translation
                                        key="AMOUNT_IS_MORE_THAN_RESERVE"
                                        id="AMOUNT_IS_MORE_THAN_RESERVE"
                                        values={{ reserve }}
                                    />
                                );
                            }
                            return 'AMOUNT_IS_NOT_ENOUGH';
                        }

                        // ERC20 without decimal places
                        if (!decimals && !isInteger(value)) {
                            return 'AMOUNT_IS_NOT_INTEGER';
                        }

                        if (!isDecimalsValid(value, decimals)) {
                            return (
                                <Translation
                                    key="AMOUNT_IS_NOT_IN_RANGE_DECIMALS"
                                    id="AMOUNT_IS_NOT_IN_RANGE_DECIMALS"
                                    values={{ decimals }}
                                />
                            );
                        }
                    }
                },
            })}
            bottomText={<InputError error={errors[buyCryptoInput]} />}
            innerAddon={<BuyCryptoSelect />}
        />
    );
};

export default BuyCryptoInput;

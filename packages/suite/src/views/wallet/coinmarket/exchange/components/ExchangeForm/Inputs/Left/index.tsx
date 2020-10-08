import { CleanSelect, Icon, Input, variables, Select } from '@trezor/components';
import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import { FIAT } from '@suite-config';
import styled from 'styled-components';
import { isDecimalsValid } from '@wallet-utils/validation';
import { useCoinmarketExchangeFormContext } from '@suite/hooks/wallet/useCoinmarketExchangeForm';
import { Translation } from '@suite/components/suite';
import {
    getBuyCryptoOptions,
    getSellCryptoOptions,
} from '@suite/utils/wallet/coinmarket/exchangeUtils';

const Wrapper = styled.div`
    display: flex;
    flex: 1;

    @media screen and (max-width: ${variables.SCREEN_SIZE.LG}) {
        flex-direction: column;
    }
`;

export const buildCurrencyOptions = () => {
    const result: { value: string; label: string }[] = [];
    FIAT.currencies.forEach(currency =>
        result.push({ value: currency, label: currency.toUpperCase() }),
    );
    return result;
};

const Inputs = () => {
    const {
        register,
        errors,
        trigger,
        control,
        // setValue,
        // clearErrors,
        formState,
        amountLimits,
        setAmountLimits,
        account,
        exchangeInfo,
    } = useCoinmarketExchangeFormContext();
    const cryptoInput = 'cryptoInput';
    const sellCryptoSelect = 'sellCryptoSelect';
    // const fiatInput = 'fiatInput';
    const buyCryptoSelect = 'buyCryptoSelect';

    const [activeInput, setActiveInput] = useState<'fiatInput' | 'cryptoInput'>(cryptoInput);

    useEffect(() => {
        trigger([cryptoInput]);
    }, [amountLimits, trigger]);

    const uppercaseSymbol = account.symbol.toUpperCase();
    const currencyOptions = buildCurrencyOptions();

    return (
        <Wrapper>
            <Input
                onFocus={() => {
                    setActiveInput(cryptoInput);
                    // setValue(fiatInput, '');
                    // clearErrors(fiatInput);
                    trigger([cryptoInput]);
                }}
                onChange={() => {
                    // setValue(fiatInput, '');
                    // clearErrors(fiatInput);
                }}
                state={errors[cryptoInput] ? 'error' : undefined}
                name={cryptoInput}
                noTopLabel
                innerRef={register({
                    validate: value => {
                        if (activeInput === cryptoInput) {
                            if (!value) {
                                if (formState.isSubmitting) {
                                    return <Translation id="TR_EXCHANGE_VALIDATION_ERROR_EMPTY" />;
                                }
                                return;
                            }

                            if (!isDecimalsValid(value, 18)) {
                                return <Translation id="TR_EXCHANGE_VALIDATION_ERROR_NOT_NUMBER" />;
                            }

                            if (amountLimits) {
                                const amount = Number(value);
                                if (amountLimits.min && amount < amountLimits.min) {
                                    return (
                                        <Translation
                                            id="TR_EXCHANGE_VALIDATION_ERROR_MINIMUM_CRYPTO"
                                            values={{
                                                minimum: amountLimits.min,
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
                                                maximum: amountLimits.max,
                                                currency: amountLimits.currency,
                                            }}
                                        />
                                    );
                                }
                            }
                        }
                    },
                })}
                bottomText={errors[cryptoInput]?.message}
                innerAddon={
                    <Controller
                        control={control}
                        name={sellCryptoSelect}
                        defaultValue={{
                            value: uppercaseSymbol,
                            label: uppercaseSymbol,
                        }}
                        render={({ onChange, value }) => {
                            return (
                                <CleanSelect
                                    onChange={(selected: any) => {
                                        onChange(selected);
                                        setAmountLimits(undefined);
                                    }}
                                    value={value}
                                    isClearable={false}
                                    options={getSellCryptoOptions(account, exchangeInfo)}
                                    isDropdownVisible={account.networkType === 'ethereum'}
                                    isDisabled={account.networkType !== 'ethereum'}
                                    minWidth="70px"
                                />
                            );
                        }}
                    />
                }
            />
            <Input
                onFocus={() => {
                    setActiveInput(cryptoInput);
                    // setValue(fiatInput, '');
                    // clearErrors(fiatInput);
                    trigger([cryptoInput]);
                }}
                onChange={() => {
                    // setValue(fiatInput, '');
                    // clearErrors(fiatInput);
                }}
                state={errors[cryptoInput] ? 'error' : undefined}
                name={cryptoInput}
                noTopLabel
                innerRef={register({
                    validate: value => {
                        if (activeInput === cryptoInput) {
                            if (!value) {
                                if (formState.isSubmitting) {
                                    return <Translation id="TR_EXCHANGE_VALIDATION_ERROR_EMPTY" />;
                                }
                                return;
                            }

                            if (!isDecimalsValid(value, 18)) {
                                return <Translation id="TR_EXCHANGE_VALIDATION_ERROR_NOT_NUMBER" />;
                            }

                            if (amountLimits) {
                                const amount = Number(value);
                                if (amountLimits.min && amount < amountLimits.min) {
                                    return (
                                        <Translation
                                            id="TR_EXCHANGE_VALIDATION_ERROR_MINIMUM_CRYPTO"
                                            values={{
                                                minimum: amountLimits.min,
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
                                                maximum: amountLimits.max,
                                                currency: amountLimits.currency,
                                            }}
                                        />
                                    );
                                }
                            }
                        }
                    },
                })}
                bottomText={errors[cryptoInput]?.message}
                innerAddon={
                    <Controller
                        control={control}
                        name={sellCryptoSelect}
                        defaultValue={currencyOptions[0]}
                        render={({ onChange, value }) => {
                            return (
                                <CleanSelect
                                    onChange={(selected: any) => {
                                        onChange(selected);
                                        setAmountLimits(undefined);
                                    }}
                                    value={value}
                                    isClearable={false}
                                    options={currencyOptions}
                                    isDropdownVisible={account.networkType === 'ethereum'}
                                    minWidth="70px"
                                />
                            );
                        }}
                    />
                }
            />
        </Wrapper>
    );
};

export default Inputs;

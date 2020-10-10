import { CleanSelect, Input, CoinLogo } from '@trezor/components';
import React, { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { FIAT } from '@suite-config';
import styled from 'styled-components';
import { isDecimalsValid } from '@wallet-utils/validation';
import { useCoinmarketExchangeFormContext } from '@suite/hooks/wallet/useCoinmarketExchangeForm';
import { Translation } from '@suite/components/suite';
import { getSellCryptoOptions } from '@suite/utils/wallet/coinmarket/exchangeUtils';

const Option = styled.div`
    display: flex;
    align-items: center;
`;

const Label = styled.div`
    padding-left: 10px;
`;

export const buildCurrencyOptions = () => {
    const result: { value: string; label: string }[] = [];
    FIAT.currencies.forEach(currency =>
        result.push({ value: currency, label: currency.toUpperCase() }),
    );
    return result;
};

const CryptoInput = () => {
    const {
        register,
        errors,
        trigger,
        control,
        formState,
        amountLimits,
        setAmountLimits,
        account,
        exchangeInfo,
    } = useCoinmarketExchangeFormContext();
    const cryptoInput = 'cryptoInput';
    const cryptoSelect = 'buyCryptoSelect';

    useEffect(() => {
        trigger([cryptoInput]);
    }, [amountLimits, trigger]);

    const uppercaseSymbol = account.symbol.toUpperCase();

    return (
        <Input
            onFocus={() => {
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
                },
            })}
            bottomText={errors[cryptoInput]?.message}
            innerAddon={
                <Controller
                    control={control}
                    name={cryptoSelect}
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
                                formatOptionLabel={(option: any) => {
                                    return (
                                        <Option>
                                            <CoinLogo size={18} symbol={account.symbol} />
                                            <Label>{option.label}</Label>
                                        </Option>
                                    );
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
    );
};

export default CryptoInput;

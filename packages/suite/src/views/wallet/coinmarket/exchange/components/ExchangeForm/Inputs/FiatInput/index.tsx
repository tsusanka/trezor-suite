import { CleanSelect, Input } from '@trezor/components';
import React from 'react';
import { Controller } from 'react-hook-form';
import { FIAT } from '@suite-config';
import styled from 'styled-components';
import { isDecimalsValid } from '@wallet-utils/validation';
import { useCoinmarketExchangeFormContext } from '@suite/hooks/wallet/useCoinmarketExchangeForm';
import { Translation } from '@suite/components/suite';

export const buildCurrencyOptions = () => {
    const result: { value: string; label: string }[] = [];
    FIAT.currencies.forEach(currency =>
        result.push({ value: currency, label: currency.toUpperCase() }),
    );
    return result;
};

const StyledInput = styled(Input)`
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
`;

const Left = () => {
    const {
        register,
        errors,
        trigger,
        control,
        formState,
        amountLimits,
        setAmountLimits,
        account,
    } = useCoinmarketExchangeFormContext();
    const fiatSelect = 'fiatSelect';
    const fiatInput = 'fiatInput';

    const currencyOptions = buildCurrencyOptions();

    return (
        <StyledInput
            onFocus={() => {
                trigger([fiatInput]);
            }}
            onChange={() => {
                // setValue(fiatInput, '');
                // clearErrors(fiatInput);
            }}
            state={errors[fiatInput] ? 'error' : undefined}
            name={fiatInput}
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
            bottomText={errors[fiatInput]?.message}
            innerAddon={
                <Controller
                    control={control}
                    name={fiatSelect}
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
    );
};

export default Left;

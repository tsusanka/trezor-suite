import { Input } from '@trezor/components';
import React from 'react';
import { FIAT } from '@suite-config';
import styled from 'styled-components';
import { isDecimalsValid } from '@wallet-utils/validation';
import { useCoinmarketExchangeFormContext } from '@wallet-hooks/useCoinmarketExchangeForm';
import { Translation } from '@suite-components';
import BuyCryptoSelect from './BuyCryptoSelect';
import { InputError } from '@wallet-components';
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
        formState,
        amountLimits,
        compose,
        updateFiatValue,
        setValue,
    } = useCoinmarketExchangeFormContext();
    const buyCryptoInput = 'buyCryptoInput';
    const fiatInput = 'fiatInput';

    return (
        <StyledInput
            onFocus={() => {
                setValue(fiatInput, '');
                clearErrors(fiatInput);
                trigger([buyCryptoInput]);
            }}
            onChange={event => {
                updateFiatValue(event.target.value);
                clearErrors(fiatInput);
                compose();
            }}
            state={errors[buyCryptoInput] ? 'error' : undefined}
            name={buyCryptoInput}
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
                },
            })}
            bottomText={<InputError error={errors[buyCryptoInput]} />}
            innerAddon={<BuyCryptoSelect />}
        />
    );
};

export default BuyCryptoInput;

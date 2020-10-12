import { Input } from '@trezor/components';
import React from 'react';
import styled from 'styled-components';
import { InputError } from '@wallet-components';
import { isDecimalsValid } from '@wallet-utils/validation';
import { useCoinmarketExchangeFormContext } from '@suite/hooks/wallet/useCoinmarketExchangeForm';
import { Translation } from '@suite/components/suite';
import FiatSelect from './FiatSelect';

const StyledInput = styled(Input)`
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
`;

const FiatInput = () => {
    const {
        register,
        network,
        clearErrors,
        errors,
        trigger,
        formState,
        amountLimits,
        updateBuyCryptoValue,
    } = useCoinmarketExchangeFormContext();
    const fiatInput = 'fiatInput';

    return (
        <StyledInput
            onFocus={() => {
                trigger([fiatInput]);
            }}
            onChange={event => {
                updateBuyCryptoValue(event.target.value, network.decimals);
                clearErrors(fiatInput);
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
            bottomText={<InputError error={errors[fiatInput]} />}
            innerAddon={<FiatSelect />}
        />
    );
};

export default FiatInput;

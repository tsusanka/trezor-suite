import React from 'react';
import BigNumber from 'bignumber.js';
import styled from 'styled-components';
import { Input, variables, colors } from '@trezor/components';
import { Translation } from '@suite-components';
import { InputError } from '@wallet-components';
import { useCoinmarketExchangeFormContext } from '@wallet-hooks/useCoinmarketExchangeForm';
import { getInputState, getFeeUnits } from '@wallet-utils/sendFormUtils';
import { isDecimalsValid, isInteger } from '@wallet-utils/validation';

const Wrapper = styled.div<{ isVisible: boolean }>`
    display: ${props => (props.isVisible ? 'flex' : 'none')};
`;

const StyledInput = styled(Input)`
    width: 120px;
`;

const Units = styled.div`
    font-size: ${variables.FONT_SIZE.TINY};
    color: ${colors.NEUE_TYPE_LIGHT_GREY};
`;

interface Props {
    isVisible: boolean;
}

const CustomFee = ({ isVisible }: Props) => {
    const {
        network,
        feeInfo,
        errors,
        register,
        compose,
        activeMaxLimit,
    } = useCoinmarketExchangeFormContext();
    const { maxFee, minFee } = feeInfo;
    const inputName = 'feePerUnit';
    const feePerUnitValue = '';
    const feePerUnitError = errors.feePerUnit;

    return (
        <Wrapper isVisible={isVisible}>
            <StyledInput
                noTopLabel
                variant="small"
                monospace
                width={120}
                wrapperProps={{ width: '120' }}
                state={getInputState(feePerUnitError, feePerUnitValue)}
                innerAddon={<Units>{getFeeUnits(network.networkType)}</Units>}
                onChange={event => {
                    compose({
                        activeMaxLimit,
                        feeLevelLabel: 'custom',
                        feePerUnit: event.target.value,
                    });
                }}
                name={inputName}
                data-test={inputName}
                innerRef={register({
                    required: 'CUSTOM_FEE_IS_NOT_SET',
                    validate: (value: string) => {
                        const feeBig = new BigNumber(value);
                        if (feeBig.isNaN()) {
                            return 'CUSTOM_FEE_IS_NOT_NUMBER';
                        }
                        // allow decimals in ETH since GWEI is not a satoshi
                        if (network.networkType !== 'ethereum' && !isInteger(value)) {
                            return 'CUSTOM_FEE_IS_NOT_INTEGER';
                        }
                        // GWEI: 9 decimal places
                        if (network.networkType === 'ethereum' && !isDecimalsValid(value, 9)) {
                            return (
                                <Translation
                                    key="AMOUNT_IS_NOT_IN_RANGE_DECIMALS"
                                    id="AMOUNT_IS_NOT_IN_RANGE_DECIMALS"
                                    values={{ decimals: 9 }}
                                />
                            );
                        }

                        if (feeBig.isGreaterThan(maxFee) || feeBig.isLessThan(minFee)) {
                            return (
                                <Translation
                                    key="CUSTOM_FEE_NOT_IN_RANGE"
                                    id="CUSTOM_FEE_NOT_IN_RANGE"
                                    values={{ minFee, maxFee }}
                                />
                            );
                        }
                    },
                })}
                bottomText={<InputError error={feePerUnitError} />}
            />
            <input type="hidden" name="feeLimit" ref={register()} />
        </Wrapper>
    );
};

export default CustomFee;

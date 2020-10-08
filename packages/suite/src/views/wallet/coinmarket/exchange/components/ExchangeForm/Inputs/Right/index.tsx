import { CleanSelect, Icon, Input, variables, Select } from '@trezor/components';
import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
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
    min-width: 160px;

    @media screen and (max-width: ${variables.SCREEN_SIZE.LG}) {
        flex-direction: column;
    }
`;

const StyledIcon = styled(Icon)`
    @media screen and (max-width: ${variables.SCREEN_SIZE.LG}) {
        transform: rotate(90deg);
    }
`;

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

    return (
        <Wrapper>
            <Controller
                control={control}
                name={buyCryptoSelect}
                render={({ onChange, value }) => {
                    return (
                        <Select
                            onChange={(selected: any) => {
                                onChange(selected);
                                setAmountLimits(undefined);
                            }}
                            noTopLabel
                            value={value}
                            isClearable={false}
                            options={getBuyCryptoOptions(account, exchangeInfo)}
                            minWidth="70px"
                        />
                    );
                }}
            />
        </Wrapper>
    );
};

export default Inputs;

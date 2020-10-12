import { variables, Select } from '@trezor/components';
import React from 'react';
import { Controller } from 'react-hook-form';
import styled from 'styled-components';
import { useCoinmarketExchangeFormContext } from '@suite/hooks/wallet/useCoinmarketExchangeForm';
import { Translation } from '@suite/components/suite';
import { getBuyCryptoOptions } from '@suite/utils/wallet/coinmarket/exchangeUtils';
import invityAPI from '@suite-services/invityAPI';

const Wrapper = styled.div`
    display: flex;
    flex: 1;
    min-width: 160px;

    @media screen and (max-width: ${variables.SCREEN_SIZE.LG}) {
        flex-direction: column;
    }
`;

const CoinLogo = styled.img`
    display: flex;
    align-items: center;
    padding-right: 6px;
    height: 16px;
`;

const Option = styled.div`
    display: flex;
    align-items: center;
`;

const SellSelect = () => {
    const { control, setAmountLimits, account, exchangeInfo } = useCoinmarketExchangeFormContext();

    return (
        <Wrapper>
            <Controller
                control={control}
                name="sellCryptoSelect"
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
                            formatOptionLabel={(option: any) => {
                                return (
                                    <Option>
                                        <CoinLogo
                                            src={`${
                                                invityAPI.server
                                            }/images/coins/${option.label.toUpperCase()}.svg`}
                                        />
                                        {option.label}
                                    </Option>
                                );
                            }}
                            noOptionsMessage={() => <Translation id="TR_COINMARKET_SELECT_COIN" />}
                        />
                    );
                }}
            />
        </Wrapper>
    );
};

export default SellSelect;

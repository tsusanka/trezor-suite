import { CleanSelect, CoinLogo } from '@trezor/components';
import React from 'react';
import { Controller } from 'react-hook-form';
import styled from 'styled-components';
import { useCoinmarketExchangeFormContext } from '@wallet-hooks/useCoinmarketExchangeForm';
import { getSellCryptoOptions } from '@wallet-utils/coinmarket/exchangeUtils';

const Option = styled.div`
    display: flex;
    align-items: center;
`;

const Label = styled.div`
    padding-left: 10px;
`;

const BuyCryptoSelect = () => {
    const {
        control,
        setAmountLimits,
        account,
        exchangeInfo,
        setToken,
    } = useCoinmarketExchangeFormContext();
    const buyCryptoSelect = 'buyCryptoSelect';
    const uppercaseSymbol = account.symbol.toUpperCase();

    return (
        <Controller
            control={control}
            name={buyCryptoSelect}
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
                            const lowerCaseToken = selected.value.toLowerCase();
                            if (lowerCaseToken === 'eth' || lowerCaseToken === 'trop') {
                                setToken(undefined);
                            } else {
                                setToken(lowerCaseToken);
                            }
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
    );
};

export default BuyCryptoSelect;

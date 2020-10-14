import { variables, Select } from '@trezor/components';
import { ExchangeInfo } from '@wallet-actions/coinmarketExchangeActions';
import React from 'react';
import { Account } from '@wallet-types';
import { symbolToInvityApiSymbol } from '@wallet-utils/coinmarket/coinmarketUtils';
import { Controller } from 'react-hook-form';
import styled from 'styled-components';
import { NETWORKS } from '@wallet-config';
import { useCoinmarketExchangeFormContext } from '@suite/hooks/wallet/useCoinmarketExchangeForm';
import { Translation } from '@suite/components/suite';
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

const buildOptions = (account: Account, exchangeInfo?: ExchangeInfo) => {
    if (!exchangeInfo) return null;

    interface Options {
        label: React.ReactElement;
        options: { label: string; value: string }[];
    }

    const native: Options = {
        label: <Translation id="TR_EXCHANGE_NATIVE_COINS" />,
        options: [],
    };

    const other: Options = {
        label: <Translation id="TR_EXCHANGE_OTHER_COINS" />,
        options: [],
    };

    exchangeInfo.buySymbols.forEach(token => {
        if (account.symbol !== token) {
            const invityToken = symbolToInvityApiSymbol(token);
            if (NETWORKS.find(network => network.symbol === invityToken)) {
                native.options.push({
                    label: token.toUpperCase(),
                    value: invityToken.toUpperCase(),
                });
            } else {
                other.options.push({
                    label: token.toUpperCase(),
                    value: invityToken.toUpperCase(),
                });
            }
        }
    });

    return [native, other];
};

const SellCryptoSelect = () => {
    const { control, setAmountLimits, account, exchangeInfo } = useCoinmarketExchangeFormContext();

    return (
        <Wrapper>
            <Controller
                control={control}
                defaultValue={false}
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
                            options={buildOptions(account, exchangeInfo)}
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
                            placeholder={<Translation id="TR_COINMARKET_SELECT_COIN" />}
                        />
                    );
                }}
            />
        </Wrapper>
    );
};

export default SellCryptoSelect;

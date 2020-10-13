import React, { useState } from 'react';
import styled from 'styled-components';
// import { getAccountInfo } from '@wallet-utils/coinmarket/coinmarketUtils';
import {
    FiatValue,
    QuestionTooltip,
    Translation,
    HiddenPlaceholder,
    AccountLabeling,
} from '@suite-components';
import { Input, colors, variables, CoinLogo, DeviceImage, Select, Icon } from '@trezor/components';
import { useCoinmarketExchangeOffersContext } from '@wallet-hooks/useCoinmarketExchangeOffers';
import { Account } from '@wallet-types';
import * as modalActions from '@suite-actions/modalActions';
import { useDispatch } from 'react-redux';
import { Dispatch } from '@suite-types';
import { useTimeoutFn } from 'react-use';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 10px;
`;

const CardContent = styled.div`
    display: flex;
    flex-direction: column;
    padding: 24px;
`;

const LogoWrapper = styled.div`
    display: flex;
    align-items: center;
    padding: 0 0 0 15px;
`;

const AccountWrapper = styled.div`
    display: flex;
    padding: 0 0 0 15px;
    flex-direction: column;
`;

const Label = styled.div`
    display: flex;
    align-items: center;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
`;

const StyledQuestionTooltip = styled(QuestionTooltip)`
    padding-left: 3px;
`;

const UpperCase = styled.div`
    text-transform: uppercase;
    padding: 0 3px;
`;

const FiatWrapper = styled.div`
    padding: 0 0 0 3px;
`;

const CustomLabel = styled(Label)`
    padding-bottom: 12px;
`;

const LabelText = styled.div``;

const StyledDeviceImage = styled(DeviceImage)`
    padding: 0 10px 0 0;
`;

const Amount = styled.div`
    display: flex;
    font-size: ${variables.FONT_SIZE.TINY};
    color: ${colors.NEUE_TYPE_LIGHT_GREY};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
`;

const AccountName = styled.div`
    display: flex;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
`;

// const FakeInput = styled.div`
//     display: flex;
//     margin-bottom: 20px;
//     padding: 5px;
//     min-height: 61px;
//     align-items: center;
//     border-radius: 4px;
//     border: solid 2px ${colors.NEUE_STROKE_GREY};
//     background: ${colors.WHITE};
// `;

// const ButtonWrapper = styled.div`
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     padding-top: 20px;
//     border-top: 1px solid ${colors.NEUE_STROKE_GREY};
//     margin: 20px 0;
// `;

const Confirmed = styled.div`
    display: flex;
    height: 60px;
    font-size: ${variables.FONT_SIZE.BIG};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    background: ${colors.NEUE_BG_GRAY};
    align-items: center;
    justify-content: center;
`;

const Option = styled.div`
    display: flex;
    align-items: center;
`;

const AccountType = styled.span`
    color: ${colors.NEUE_TYPE_LIGHT_GREY};
    padding-left: 5px;
`;

type AccountSelectOption = {
    type: 'SUITE' | 'ADD_SUITE' | 'NON_SUITE';
    account?: Account;
};

const VerifyAddressComponent = () => {
    const {
        device,
        // verifyAddress,
        selectedQuote,
        addressVerified,
        suiteBuyAccounts,
    } = useCoinmarketExchangeOffersContext();
    const [selectedAccountOption, setSelectedAccountOption] = useState<AccountSelectOption>();
    const [menuIsOpen, setMenuIsOpen] = useState<boolean | undefined>(undefined);

    const dispatch = useDispatch<Dispatch>();

    // const { path, address } = getAccountInfo(account);

    // if (!path || !address || !selectedQuote) {
    //     return null;
    // }

    const selectAccountOptions: AccountSelectOption[] = [];

    if (suiteBuyAccounts) {
        suiteBuyAccounts.forEach(account => {
            selectAccountOptions.push({ type: 'SUITE', account });
        });
        selectAccountOptions.push({ type: 'ADD_SUITE' });
    }
    selectAccountOptions.push({ type: 'NON_SUITE' });

    const onChangeAccount = (account: AccountSelectOption) => {
        if (account.type === 'ADD_SUITE') {
            if (device) {
                setMenuIsOpen(true);
                dispatch(
                    modalActions.openModal({
                        type: 'add-account',
                        device: device!,
                        symbol: selectedQuote?.receive?.toLowerCase() as Account['symbol'],
                        noRedirect: true,
                    }),
                );
            }
        } else {
            setSelectedAccountOption(account);
            setMenuIsOpen(undefined);
        }
    };

    // preselect the account after everything is loaded
    useTimeoutFn(() => {
        console.log('selectAccountOptions', selectAccountOptions);
        if (selectAccountOptions.length > 0 && selectAccountOptions[0].type !== 'ADD_SUITE') {
            setSelectedAccountOption(selectAccountOptions[0]);
        }
    }, 100);

    return (
        <Wrapper>
            <CardContent>
                <CustomLabel>
                    <LabelText>
                        <Translation id="TR_EXCHANGE_RECEIVING_ACCOUNT" />
                    </LabelText>
                    <StyledQuestionTooltip tooltip="TR_EXCHANGE_RECEIVE_ACCOUNT_QUESTION_TOOLTIP" />
                </CustomLabel>

                <Select
                    onChange={(selected: any) => {
                        onChangeAccount(selected);
                    }}
                    noTopLabel
                    value={selectedAccountOption}
                    isClearable={false}
                    options={selectAccountOptions}
                    minWidth="70px"
                    formatOptionLabel={(option: AccountSelectOption) => {
                        switch (option.type) {
                            case 'SUITE': {
                                if (!option.account) return null;
                                const { symbol, formattedBalance } = option.account;
                                return (
                                    <Option>
                                        <LogoWrapper>
                                            <CoinLogo size={25} symbol={symbol} />
                                        </LogoWrapper>
                                        <AccountWrapper>
                                            <AccountName>
                                                <AccountLabeling account={option.account} />
                                                <AccountType>
                                                    {option.account.accountType !== 'normal'
                                                        ? option.account.accountType
                                                        : ''}
                                                </AccountType>
                                            </AccountName>
                                            <Amount>
                                                <HiddenPlaceholder>
                                                    {formattedBalance}
                                                </HiddenPlaceholder>{' '}
                                                <UpperCase>{symbol}</UpperCase> •
                                                <FiatWrapper>
                                                    <FiatValue
                                                        amount={formattedBalance}
                                                        symbol={symbol}
                                                    />
                                                </FiatWrapper>
                                            </Amount>
                                        </AccountWrapper>
                                    </Option>
                                );
                            }
                            case 'ADD_SUITE':
                                return (
                                    <Option>
                                        <LogoWrapper>
                                            <Icon
                                                icon="PLUS"
                                                size={25}
                                                color={colors.NEUE_TYPE_DARK_GREY}
                                            />
                                        </LogoWrapper>
                                        <AccountWrapper>
                                            <Translation
                                                id="TR_EXCHANGE_CREATE_SUITE_ACCOUNT"
                                                values={{ symbol: selectedQuote?.receive }}
                                            />
                                        </AccountWrapper>
                                    </Option>
                                );
                            case 'NON_SUITE':
                                return (
                                    <Option>
                                        <LogoWrapper>
                                            <Icon
                                                icon="NON_SUITE"
                                                size={25}
                                                color={colors.NEUE_TYPE_DARK_GREY}
                                            />
                                        </LogoWrapper>
                                        <AccountWrapper>
                                            <Translation
                                                id="TR_EXCHANGE_USE_NON_SUITE_ACCOUNT"
                                                values={{ symbol: selectedQuote?.receive }}
                                            />
                                        </AccountWrapper>
                                    </Option>
                                );
                            default:
                                return null;
                        }
                    }}
                    isDropdownVisible={selectAccountOptions.length === 1}
                    isDisabled={selectAccountOptions.length === 1}
                    placeholder={
                        <Translation
                            id="TR_EXCHANGE_SELECT_RECEIVE_ACCOUNT"
                            values={{ symbol: selectedQuote?.receive }}
                        />
                    }
                    menuIsOpen={menuIsOpen}
                />

                <Input
                    label={
                        <Label>
                            <Translation id="TR_EXCHANGE_RECEIVING_ADDRESS" />
                            <StyledQuestionTooltip tooltip="TR_EXCHANGE_RECEIVE_ADDRESS_QUESTION_TOOLTIP" />
                        </Label>
                    }
                    // value={address}
                    readOnly
                />
                {addressVerified && (
                    <Confirmed>
                        {device && (
                            <StyledDeviceImage
                                height={25}
                                trezorModel={device.features?.major_version === 1 ? 1 : 2}
                            />
                        )}
                        <Translation id="TR_BUY_CONFIRMED_ON_TREZOR" />
                    </Confirmed>
                )}
            </CardContent>
            {/* <ButtonWrapper>
                {!addressVerified && (
                    <Button onClick={() => verifyAddress(path, address)}>
                        <Translation id="TR_BUY_CONFIRM_ON_TREZOR" />
                    </Button>
                )}
                {addressVerified && (
                    <Button onClick={() => goToPayment(address)}>
                        <Translation id="TR_BUY_GO_TO_PAYMENT" />
                    </Button>
                )}
            </ButtonWrapper> */}
        </Wrapper>
    );
};

export default VerifyAddressComponent;

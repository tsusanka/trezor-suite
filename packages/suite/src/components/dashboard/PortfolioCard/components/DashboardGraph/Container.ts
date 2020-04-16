import { connect } from 'react-redux';
import * as graphActions from '@wallet-actions/graphActions';
import { AppState, Dispatch } from '@suite-types';
import { Account } from '@wallet-types';
import Component from './index';
import { bindActionCreators } from 'redux';

const mapStateToProps = (state: AppState) => ({
    localCurrency: state.wallet.settings.localCurrency,
    graph: state.wallet.graph,
    selectedDevice: state.suite.device,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    updateGraphData: bindActionCreators(graphActions.updateGraphData, dispatch),
    setSelectedRange: bindActionCreators(graphActions.setSelectedRange, dispatch),
});

interface OwnProps {
    discoveryInProgress: boolean;
    accounts: Account[];
}
export type Props = ReturnType<typeof mapStateToProps> &
    ReturnType<typeof mapDispatchToProps> &
    OwnProps;

export default connect(mapStateToProps, mapDispatchToProps)(Component);

import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import ExecutionContext from './ExecutionContext';
import FeeSelector from './FeeSelector';
import Footer from './Footer';
import TxParties from './TxParties';
import {
  confirmTx,
  determineIfContract,
  estimateGasUsage,
  getGasPrice,
  getPriceConversion,
  lookupSignature,
  setWindowSize,
  togglePriority
} from '../../actions.js';

class SendTx extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasSignature: false
    };
  }

  componentDidMount() {
    this.getGasPrice();
    this.determineIfContract();
    this.lookupSignature();
    this.estimateGasUsage();
    this.getPriceConversion();
    setTimeout(this.adjustWindowHeight, 500);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.newTx.gasError !== this.props.newTx.gasError) {
      this.adjustWindowHeight();
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  getGasPrice = () => {
    this.props.dispatch(getGasPrice());
  };

  determineIfContract = () => {
    this.props.dispatch(determineIfContract(this.props.newTx.to));
  };

  lookupSignature = () => {
    const { data } = this.props.newTx;
    this.props.dispatch(lookupSignature(data));
  };

  estimateGasUsage = () => {
    this.props.dispatch(estimateGasUsage());
  };

  getPriceConversion = () => {
    this.props.dispatch(getPriceConversion());
  };

  adjustWindowHeight = () => {
    const height = this.divElement.clientHeight;
    this.props.dispatch(setWindowSize(height));
  };

  togglePriority = () => {
    this.props.dispatch(togglePriority());
  };

  handleSubmit = formData => {
    const {
      data,
      to,
      from,
      gas,
      gasPrice,
      estimatedGas,
      priority,
      value
    } = this.props.newTx;

    // If no gas value was provided, use estimatedGas
    const gasValue =
      parseInt(gas, 16) !== 0 ? gas : `0x${estimatedGas.toString(16)}`;

    // If priority tx, double the value and format it
    const chosenPrice = priority
      ? '0x' + (gasPrice * 2).toString(16)
      : gasPrice;

    let txData = {
      data,
      from,
      gas: gasValue,
      gasPrice: chosenPrice,
      pw: formData.pw,
      value
    };

    if (to) {
      txData.to = to;
    }

    this.props.dispatch(confirmTx(txData));
  };

  render() {
    const { from, to, value } = this.props.newTx;

    return (
      <div className="popup-windows tx-info">
        <div ref={divElement => (this.divElement = divElement)}>
          <ExecutionContext
            adjustWindowHeight={this.adjustWindowHeight}
            estimatedGas={this.props.newTx.estimatedGas}
            executionFunction={this.props.newTx.executionFunction}
            gasPrice={this.props.newTx.gasPrice}
            gasError={this.props.newTx.gasError}
            isNewContract={this.props.newTx.isNewContract}
            params={this.props.newTx.params}
            toIsContract={this.props.newTx.toIsContract}
            value={this.props.newTx.value}
            token={this.props.newTx.token}
          />

          <TxParties
            fromIsContract={this.state.fromIsContract}
            from={from}
            isNewContract={this.props.newTx.isNewContract}
            to={to}
            toIsContract={this.props.newTx.toIsContract}
            executionFunction={this.props.newTx.executionFunction}
            params={this.props.newTx.params}
            hasSignature={this.state.hasSignature}
            value={value}
          />

          <FeeSelector
            estimatedGas={this.props.newTx.estimatedGas}
            gasLoading={this.props.newTx.gasLoading}
            gasPrice={this.props.newTx.gasPrice}
            getGasPrice={this.getGasPrice}
            getGasUsage={this.estimateGasUsage}
            etherPriceUSD={this.props.etherPriceUSD}
            network={this.props.network}
            priority={this.props.newTx.priority}
            togglePriority={this.togglePriority}
          />

          <Footer
            unlocking={this.props.newTx.unlocking}
            estimatedGas={this.props.newTx.estimatedGas}
            gasPrice={this.props.newTx.gasPrice}
            gasError={this.props.newTx.gasError}
            handleSubmit={this.handleSubmit}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    etherPriceUSD: state.settings.etherPriceUSD,
    network: state.nodes.network,
    newTx: state.newTx
  };
}

export default connect(mapStateToProps)(SendTx);

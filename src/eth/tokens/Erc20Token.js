import { utils } from 'ethers';
import CurrencyUnits, { Currency } from '../CurrencyUnits';

export default class Erc20Token {
  constructor(
    contract,
    web3Service,
    decimals = 18,
    transactionManager,
    symbol
  ) {
    this._contract = contract;
    this._web3Service = web3Service;
    this._decimals = decimals;
    this._transactionManager = transactionManager;
    this.symbol = symbol;
  }

  allowance(tokenOwner, spender) {
    return this._contract
      .allowance(tokenOwner, spender)
      .then(value => this.toUserFormat(value));
  }

  balanceOf(owner) {
    return this._contract.balanceOf(owner).then(_ => this.toUserFormat(_));
  }

  address() {
    return this._contract.getAddress();
  }

  decimals() {
    return this._decimals;
  }

  //think of name ToDecimal?
  toUserFormat(value) {
    return CurrencyUnits.convert(value, this.symbol, this._decimals);
  }

  // TODO should we be pickier about what input we accept here?
  toEthereumFormat(value) {
    const amount =
      value instanceof Currency ? value.toNumber() : value.toString();
    try {
      return utils.parseUnits(amount, this._decimals);
    } catch (err) {
      throw new Error(`Invalid value: ${amount} / ${value}`);
    }
  }

  approve(spender, value) {
    const valueInWei = this.toEthereumFormat(value);
    return this._transactionManager.createTransactionHybrid(
      this._contract.approve(spender, valueInWei)
    );
  }

  approveUnlimited(spender) {
    return this._transactionManager.createTransactionHybrid(
      this._contract.approve(spender, -1)
    );
  }

  transfer(to, value) {
    const valueInWei = this.toEthereumFormat(value);
    return this._transactionManager.createTransactionHybrid(
      this._contract.transfer(to, valueInWei)
    );
  }

  transferFrom(from, to, value) {
    const valueInWei = this.toEthereumFormat(value);
    return this._transactionManager.createTransactionHybrid(
      this._contract.transferFrom(from, to, valueInWei)
    );
  }

  totalSupply() {
    return this._contract.totalSupply().then(_ => this.toUserFormat(_));
  }
}

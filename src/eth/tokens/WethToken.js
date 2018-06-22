import Erc20Token from './Erc20Token';

export default class WethToken extends Erc20Token {
  constructor(contract, web3Service, decimals, transactionManager, symbol) {
    super(contract, web3Service, decimals, transactionManager, symbol);
    this._transactionManager = transactionManager;
  }

  name() {
    return this._contract.name();
  }

  deposit(amount) {
    const valueInWei = this.toEthereumFormat(amount);

    return this._transactionManager.createTransactionHybrid(
      this._contract.deposit({
        value: valueInWei
      })
    );
  }

  withdraw(amount) {
    const valueInWei = this.toEthereumFormat(amount);

    return this._transactionManager.createTransactionHybrid(
      this._contract.withdraw(valueInWei)
    );
  }
}

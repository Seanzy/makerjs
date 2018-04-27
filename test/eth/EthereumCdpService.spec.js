import EthereumCdpService from '../../src/eth/EthereumCdpService';
import tokens from '../../contracts/tokens';
import contracts from '../../contracts/contracts';

let createdCdpService;
let createdCdpId;

beforeAll(() => {
  return createdCdpService = EthereumCdpService.buildTestService();
});

function openCdp(){
  createdCdpService = EthereumCdpService.buildTestService();
  return createdCdpService.manager().authenticate()
    .then(() => createdCdpService.openCdp())
    .onMined()
    .then(cdp => cdp.getCdpId())
    .then(cdpId => {
      createdCdpId = cdpId;
    });
}

function lockEth(amount){
  return openCdp()
    .then(() => createdCdpService.lockEth(createdCdpId, amount))
    .onMined()
    .then(cdp => cdp.getCdpInfo())
}


test('should open a CDP and get cdp ID', done => {
  return createdCdpService.manager().authenticate().then(() => {
    createdCdpService.openCdp()
    .onMined()
    .then(cdp => cdp.getCdpId())
    .then(id => {
      expect(typeof id).toBe('number');
      expect(id).toBeGreaterThan(0);
      done();
    });
  });
}, 10000);

test('should check if a cdp for a specific id exists', done => {
  createdCdpService.manager().authenticate().then(() => {
    createdCdpService.openCdp()
    .onMined()
    .then(cdp => cdp.getCdpId())
      .then(cdpId => createdCdpService.getCdpInfo(cdpId))
        .then((result) => {
            expect(result).toBeTruthy();
            expect(result.lad).toMatch(/^0x[A-Fa-f0-9]{40}$/);
            done();
          });
        });
}, 10000);

test('should open and then shut a CDP', done => {
  createdCdpService.manager().authenticate().then(() => {
    createdCdpService.openCdp()
    .onMined()
    .then(cdp => {
      cdp.getCdpId()
      .then(id => {
        createdCdpService.getCdpInfo(id)
        .then(firstInfoCall => {
          createdCdpService.shutCdp(id)
          .catch((err) => { 
            done.fail(new Error('shutting CDP had an error: ', err));
          })
          .then(() => {  
            createdCdpService.getCdpInfo(id)
            .then(secondInfoCall => {
              expect(firstInfoCall).not.toBe(secondInfoCall);
              expect(secondInfoCall.lad).toBe('0x0000000000000000000000000000000000000000');
              done();
            });
          });
        });
      });
    });
  });
});

test('should be able to lock eth in a cdp', done => {
  let firstInfoCall;
  let cdpId;

    openCdp()
    .then(() => createdCdpService.getCdpInfo(createdCdpId))
    .then(result => firstInfoCall = result)
    .then(() => createdCdpService.lockEth(createdCdpId, '.1'))
    .then(() => createdCdpService.getCdpInfo(createdCdpId))
    .then(secondInfoCall => {
      expect(firstInfoCall.ink.toString()).toEqual('0');
      expect(secondInfoCall.ink.toString()).toEqual('100000000000000000');
      done();
    });
}, 20000);

/*
test.skip('should lock 2 Peth and draw 1 Dai from a cdp', done => {
  let drawnAmount;

  lockEth('2')
  .then(() => {
    const contract = createdCdpService.get('smartContract'),
     tubContract = contract.getContractByName(contracts.TUB),
     daiToken = createdCdpService.get('token').getToken(tokens.DAI);
    
     return Promise.all([
       daiToken.approveUnlimited(tubContract.address),
       tubContract.chi(),
       tubContract.rhi(),
       tubContract.era(),
       tubContract.cap(),
      ])
    })
  .then(results => console.log('chi, rhi, era, and cap are: ', results.slice(1,5)))
  .then(() => createdCdpService.drawDai(createdCdpId, '1')) //testnet price feed configured to be 400 USD per eth
  .then(() => createdCdpService.getCdpInfo(createdCdpId))
  .then(result => {
    console.log(result);
    drawnAmount = result.art.toString();
    expect(drawnAmount).toBe('1');
    // check { _bn: <BN: 33b2e3c9fd0803ce8000000> } value
    done();
  });
}, 30000);

test.skip('should draw 10 dai and then wipe 5 from a cdp', done => {
  let drawnAmount;

  drawDai('10').then(cdpId => {
    createdCdpService.getCdpInfo(createdCdpId)
        .then(result => {
          console.log(result);
          drawnAmount = result.art.toString();
          expect(drawnAmount).toBe('10');
        })
        .then(createdCdpService.wipeDai(cdpId, '5')) //testnet price feed configured to be 100 USD per eth
        .then(result => {
          console.log(result)
          expect(result).toBeFalsy();    
          createdCdpService.getCdpInfo(createdCdpId)
            .then(result => {
              drawnAmount = result.art.toString();
              expect(drawnAmount).toBe('5');
              done();
            }); 
        });
  });
}, 30000);
*/

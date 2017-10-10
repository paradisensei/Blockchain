import React, { Component } from 'react'

import Employee from './components/employee'
import Org from './components/org'
import getWeb3 from './utils/getWeb3'
import store from './store'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      // 1 - employee, 2 - org, 3 - none
      flag: 0
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    getWeb3
    .then(results => {
      this.setState(results)

      // Instantiate contract once web3 is provided.
      this.instantiateContract()

      // Find current user
      this.findUser()
    })
  }

  instantiateContract() {
    const contract = require('../build/contracts/CareerTrackerRaw.json');
    const careerTracker = this.state.web3.eth
            .contract(contract.abi).at(contract.address);
    this.setState({
      contract: careerTracker
    });

    store.dispatch({
      type: 'CONTRACT_INITIALIZED',
      payload: careerTracker
    })
  }

  findUser() {
    this.state.web3.eth.getAccounts((e, accounts) => {
      const etherbase = accounts[0];
      this.state.contract.employees.call(etherbase, (e, result) => {
        if (!e && result[1]) {
          store.dispatch({type: 'USER', payload: {
            address: etherbase,
            name: result[0],
            email: result[1],
            position: result[2],
            city: result[3],
            passport: result[4].toNumber()
          }})
          this.setState({
            flag: 1
          })
        } else {
          this.state.contract.orgs.call(etherbase, (e, result) => {
            let flag = 2
            if (!e && result[0]) {
              store.dispatch({type: 'USER', payload: {
                address: etherbase,
                name: result[0],
                city: result[1],
                sphere: result[2]
              }})
            } else {
              flag = 3
            }
            this.setState({
              flag: flag
            })
          });
        }
      });
    });
  }

  render() {
    let body = null
    switch (this.state.flag) {
      case 1:
        body = <Employee/>
        break
      case 2:
        body = <Org/>
        break
      case 3:
        body = <div className="pure-u-1-1"><p>Нет уч. записи!</p></div>
    }

    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Career tracker</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            {body}
          </div>
        </main>
      </div>
    );
  }
}

export default App

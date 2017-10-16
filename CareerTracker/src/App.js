import React, { Component } from 'react'
import Web3 from 'web3';

import Employee from './components/employee'
import Org from './components/org'
import store from './store'

import { Button } from 'react-bootstrap';

class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      // 1 - employee, 2 - org, 3 - none
      flag: 0,
      web3:  new Web3(Web3.givenProvider || "http://localhost:8545")
    }
  }

  componentWillMount() {
    // Instantiate contract once web3 is provided.
    this.instantiateContract()

    // Find current user
    this.findUser()
  }

  instantiateContract() {
    const contractInfo = require('../build/contracts/CareerTrackerInfo.json');
    const careerTracker = new this.state.web3.eth
            .Contract(contractInfo.abi, contractInfo.address);
    this.setState({
      contract: careerTracker
    });

    store.dispatch({
      type: 'CONTRACT_INITIALIZED',
      payload: careerTracker
    })
  }

  findUser() {
    let etherbase;
    this.state.web3.eth.getAccounts()
      .then(accounts => {
        etherbase = accounts[0];
        return this.state.contract.methods.employees(etherbase).call();
      })
      .then(employee => {
        if (employee[1]) {
          store.dispatch({type: 'USER', payload: {
            address: etherbase,
            name: employee[0],
            email: employee[1],
            position: employee[2],
            city: employee[3],
            passport: Number(employee[4])
          }})
          this.setState({
            flag: 1
          })
        } else {
          this.state.contract.methods.orgs(etherbase).call((e, org) => {
            let flag = 2
            if (!e && org[0]) {
              store.dispatch({type: 'USER', payload: {
                address: etherbase,
                name: org[0],
                city: org[1],
                sphere: org[2]
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
  }

  render() {
    let body = null
    switch (this.state.flag) {
      case 1:
        body = <Employee/>;
        break;
      case 2:
        body = <Org/>;
        break;
      case 3:
        body = <p>Нет уч. записи!</p>;
        break;
      default:
        // will NOT execute
    }

    return (
      <div>{body}</div>
    );
  }
}

export default App

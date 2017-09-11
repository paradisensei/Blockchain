import React, { Component } from 'react'
import CareerTrackerContract from '../build/contracts/CareerTracker.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract')
    const careerTracker = contract(CareerTrackerContract)
    careerTracker.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on CareerTracker.
    var careerTrackerInstance

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      careerTracker.deployed().then((instance) => {
        careerTrackerInstance = instance

        // Add a new employee.
        return careerTrackerInstance.newEmployee(
          'John', 'asdasd@gmail.com', 'Developer',
          'Kazan', 1234456789, {from: accounts[0]})
      }).then((result) => {
        // Get the employee from the contract to prove it worked.
        return careerTrackerInstance.employees.call(accounts[0])
      }).then((result) => {
        // Update state with the result.
        return this.setState({
          user: {
            name: result[0],
            email: result[1],
            position: result[2],
            city: result[3],
            passport: result[4].toNumber()
          }
        })
      })
      .catch(() => {
        console.log('Interaction with contract failed.')
      })
    })
  }

  render() {
    if (!this.state.user) {
      return <h1>Loading...</h1>
    }
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Career tracker</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Hi!, {this.state.user.name}</h1>
              <p><strong>Your data:</strong></p>
              <p>Email: {this.state.user.email}</p>
              <p>Position: {this.state.user.position}</p>
              <p>City: {this.state.user.city}</p>
              <p>Passport number: {this.state.user.passport}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App

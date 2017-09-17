import React, { Component } from 'react'
import getWeb3 from './utils/getWeb3'
import getDate from './utils/getDate'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      employees: []
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
    const contract = require('../build/contracts/CareerTrackerRaw.json');
    const careerTracker = this.state.web3.eth
            .contract(contract.abi).at(contract.address);
    this.setState({
      contract: careerTracker
    });

    this.state.web3.eth.getAccounts((error, accounts) => {
      const etherbase = accounts[0];
      this.setState({
        etherbase: etherbase
      });
      careerTracker.employees.call(etherbase, (e, result) => {
        if (!e && result[1]) {
          this.setState({
            employee: {
              name: result[0],
              email: result[1],
              position: result[2],
              city: result[3],
              passport: result[4].toNumber()
            }
          });

          // check offers
          careerTracker.getLastOfferIndex.call({from: etherbase}, (e, result) => {
            const index = result.toNumber();
            if (!e && index >= 0) {
              careerTracker.offersOf.call(etherbase, index, (e, result) => {
                const offer = result;
                if (!e && offer[0] && !offer[3].toNumber()) {
                  careerTracker.orgs.call(offer[0], (e, result) => {
                    this.setState({
                      offer: {
                        orgName: result[0],
                        position: offer[1],
                        date: getDate(new Date(offer[2].toNumber())),
                        index: index
                      }
                    });
                  });
                }
              });
            }
          })
          
          // check current employer
          careerTracker.getCurrentEmployer.call({from: etherbase}, (e, result) => {
            if (!e && result != 0) {
              careerTracker.orgs.call(result, (e, result) => {
                if (!e && result[0]) {
                  this.setState({
                    employer: {
                      name: result[0],
                      city: result[1],
                      sphere: result[2]
                    }
                  });
                }
              });
            }
          });
        } else {
          careerTracker.orgs.call(etherbase, (e, result) => {
            if (!e && result[0]) {
              this.setState({
                org: {
                  name: result[0],
                  city: result[1],
                  sphere: result[2]
                }
              });
            }
          });

          // get employees
          careerTracker.getEmployees.call({from: etherbase}, (e, result) => {
            if (!e && result.length != 0) {
              for (var i in result) {
                careerTracker.employees.call(result[i], (e, result) => {
                  if (!e && result[1]) {
                    const arr = this.state.employees.slice();
                    arr.push({
                      name: result[0],
                      email: result[1],
                      position: result[2],
                      city: result[3],
                      passport: result[4].toNumber()
                    });
                    this.setState({
                      employees: arr
                    });
                  }
                });
              }
            }
          })
        }
      });
    });
  }

  render() {
    let body = null
    if (this.state.org) {
      let employees = null;
      if (this.state.employees.length != 0) {
        employees = this.state.employees.map((e) =>
          <li>{e.name}, Email: {e.email}</li>
        );
      }
      let innerBody = null;
      if (employees) {
        innerBody = <div>
          <h3>Ваши сотрудники</h3>
          {employees}
        </div>
      }
      body = <div className="pure-u-1-1">
        <h2>Профиль вашей организации</h2>
        <p><i>Название:</i> {this.state.org.name}</p>
        <p><i>Город:</i> {this.state.org.city}</p>
        <p><i>Сфера деятельности:</i> {this.state.org.sphere}</p>
        {innerBody}
      </div>
    } else if (this.state.employee) {
      let offer = null
      let employer = null;
      if (this.state.offer) {
        offer = <div>
          <h3>Ваши офферы</h3>
          <p>
            {this.state.offer.date} {this.state.offer.orgName} пригласил/а 
            вас на должность {this.state.offer.position}
          </p>
          <button onClick={considerOffer.bind(this, true)}>Принять</button>
          <button onClick={considerOffer.bind(this, false)}>Отказаться</button>
        </div>
      }
      if (this.state.employer) {
        employer = <div>
          <h3>Ваш текущий работодатель</h3>
          <p><i>Название:</i> {this.state.employer.name}</p>
          <p><i>Город:</i> {this.state.employer.city}</p>
          <p><i>Сфера деятельности:</i> {this.state.employer.sphere}</p>
        </div>
      }
      body = <div className="pure-u-1-1">
        <h2>Ваш профиль</h2>
        <p><i>ФИО:</i> {this.state.employee.name}</p>
        <p><i>Email:</i> {this.state.employee.email}</p>
        <p><i>Желаемая должность:</i> {this.state.employee.position}</p>
        <p><i>Город:</i> {this.state.employee.city}</p>
        <p><i>Паспортные данные:</i> {this.state.employee.passport}</p>
        {employer}
        {offer}
      </div>
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

function considerOffer(approve) {
  const index = this.state.offer.index;
  this.state.contract.considerOffer(
    index, approve, {from: this.state.etherbase}, (e, result) => {});
}

export default App

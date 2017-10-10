import React, { Component } from 'react'
import getDate from '../utils/getDate'
import store from '../store'

class Employee extends Component {

  constructor(props) {
    super(props)

    this.state = {}
  }

  componentWillMount() {
    // get contract and user from app state
    const state = store.getState()
    const contract = state.contract
    const user = state.user

    // get last offer
    // TODO get all offers with 'No' status
    contract.getLastOfferIndex.call({from: user.address}, (e, result) => {
      let index = result.toNumber();
      if (!e && index >= 0) {
        contract.offersOf.call(user.address, index, (e, result) => {
          const offer = result;
          if (offer[0] && !offer[3].toNumber()) {
            contract.orgs.call(offer[0], (e, result) => {
              this.setState({
                offer: {
                  orgName: result[0],
                  position: offer[1],
                  date: getDate(new Date(offer[2].toNumber())),
                  index: index
                }
              })
            });
          }
        });
      }
    })
    
    // check current employer
    contract.getCurrentEmployer.call({from: user.address}, (e, result) => {
      if (!e && result != 0) {
        contract.orgs.call(result, (e, result) => {
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
  }

  render() {
    let offer = null;
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

    const user = store.getState().user
    return (
      <div className="pure-u-1-1">
        <h2>Ваш профиль</h2>
        <p><i>ФИО:</i> {user.name}</p>
        <p><i>Email:</i> {user.email}</p>
        <p><i>Желаемая должность:</i> {user.position}</p>
        <p><i>Город:</i> {user.city}</p>
        <p><i>Паспортные данные:</i> {user.passport}</p>
        {employer}
        {offer}
      </div>
    );
  }
}

function considerOffer(approve) {
  const state = store.getState();
  const index = this.state.offer.index;
  state.contract.considerOffer(
    index, approve, {from: state.user.address}, (e, result) => {});
}

export default Employee

import React, { Component } from 'react'
import getDate from '../utils/getDate'
import store from '../store'

class Employee extends Component {

  constructor(props) {
    super(props)

    this.state = {
      offers: []
    }
  }

  componentWillMount() {
    // get contract and user from app state
    const state = store.getState()
    const contract = state.contract
    const user = state.user

    // get all offers with 'No' status
    contract.methods.getOffersLength().call({from: user.address}).then(length => {
      for (var i = 0; i < Number(length); i++) {
        contract.methods.offersOf(user.address, i).call({from: user.address}, (e, offer) => {
          if (offer[0] && Number(offer[3]) === 0) {
            contract.methods.orgs(offer[0]).call((e, org) => {
              const arr = this.state.offers.slice();
              arr.push({
                orgName: org[0],
                position: offer[1],
                date: getDate(new Date(Number(offer[2]))),
                index: i
              });
              this.setState({
                offers: arr
              });
            });
          }
        });
      }
    })
    
    // check current employer
    contract.methods.getCurrentEmployer().call({from: user.address})
      .then(result => {
        console.log(result);
        if (result !== 0) {
          contract.methods.orgs(result).call((e, result) => {
            this.setState({
              employer: {
                name: result[0],
                city: result[1],
                sphere: result[2]
              }
            });
          });
        }
    })
    .catch(e => console.log(e));
  }

  render() {
    let offers = null;
    let employer = null;

    if (this.state.offers && this.state.offers.length !== 0) {
      offers = <div>
        <h3>Ваши офферы</h3>
        <ul> 
          {
            this.state.offers.map((o) =>
              <li>
                <p>
                {o.date} {o.orgName} пригласил/а вас на должность {o.position}
                </p>
                <button onClick={considerOffer.bind(this, o.index, true)}>Принять</button>
                <button onClick={considerOffer.bind(this, o.index, false)}>Отказаться</button>
              </li>
            )
          }
        </ul>
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
      <div>
        <h2>Ваш профиль</h2>
        <p><i>ФИО:</i> {user.name}</p>
        <p><i>Email:</i> {user.email}</p>
        <p><i>Желаемая должность:</i> {user.position}</p>
        <p><i>Город:</i> {user.city}</p>
        <p><i>Паспортные данные:</i> {user.passport}</p>
        {employer}
        {offers}
      </div>
    );
  }
}

function considerOffer(index, approve) {
  const state = store.getState();
  console.log(index, approve);
  state.contract.methods.considerOffer(index, approve)
    .send({from: state.user.address}, (e, result) => {});
}

export default Employee

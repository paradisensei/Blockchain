import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import getDate from '../utils/getDate';
import store from '../store';

class Employee extends Component {

  constructor(props) {
    super(props)

    this.state = {
      offers: [],
      empRecords: []
    }
  }

  componentWillMount() {
    // get contract and user from app state
    const state = store.getState()
    const contract = state.contract
    const user = state.user

    // get all offers with 'No' status
    contract.methods.getOffersCount().call({from: user.address}).then(count => {
      for (var i = 0; i < Number(count); i++) {
        const index = i;
        contract.methods.offersOf(user.address, i).call((e, offer) => {
          if (offer[0] && Number(offer[3]) === 0) {
            contract.methods.orgInfo(offer[0]).call((e, org) => {
              const arr = this.state.offers.slice();
              arr.push({
                orgName: org[0],
                position: offer[1],
                date: getDate(new Date(Number(offer[2]))),
                index: index
              });
              this.setState({
                offers: arr
              });
            });
          }
        });
      }
    })

    // get employment records
    contract.methods.getEmpRecordsCount().call({from: user.address}).then(count => {
      for (var i = 0; i < Number(count); i++) {
        contract.methods.empRecordsOf(user.address, i).call((e, record) => {
          if (record[0]) {
            contract.methods.orgInfo(record[0]).call((e, org) => {
              const arr = this.state.empRecords.slice();
              arr.push({
                orgName: org[0],
                position: record[1],
                date: getDate(new Date(Number(record[2]))),
                status: record[3]
              });
              this.setState({
                empRecords: arr
              });
            });
          }
        });
      }
    })
  }

  render() {
    let offers, empRecords;

    if (this.state.offers && this.state.offers.length > 0) {
      offers = <div>
        <h3>Ваши офферы</h3>
        <ul>
          {
            this.state.offers.map((o) =>
              <li key={o.date}>
                <p>
                {o.date} {o.orgName} пригласил/а вас на должность {o.position}
                </p>
                <Button onClick={considerOffer.bind(this, o.index, true)}>
                  Принять
                </Button>
                <Button onClick={considerOffer.bind(this, o.index, false)}>
                  Отказаться
                </Button>
              </li>
            )
          }
        </ul>
      </div>
    }

    if (this.state.empRecords && this.state.empRecords.length > 0) {
      empRecords = <div>
        <h3>Ваш послужной список</h3>
        <ul> {
          this.state.empRecords.map((r) => {
            const text = r.status == 0 ? 'приняты на должность'
              : 'уволены с должности';
            return (
              <li key={r.date}>
                <p>{r.date} вы были {text} {r.position} в {r.orgName}</p>
              </li>
            );
          })
        } </ul>
      </div>
    }

    const user = store.getState().user
    return (
      <div>
        <h2>Ваш профиль</h2>
        <p><i>ФИО:</i> {user.name}</p>
        <p><i>Email:</i> {user.email}</p>
        <p><i>Профессия:</i> {user.profession}</p>
        <p><i>Город:</i> {user.city}</p>
        <p><i>Паспортные данные:</i> {user.passport}</p>
        {offers}
        {empRecords}
      </div>
    );
  }
}

function considerOffer(index, approve) {
  const state = store.getState();
  state.contract.methods.considerOffer(index, approve)
    .send({from: state.user.address}, (e, result) => {});
}

export default Employee

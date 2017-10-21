import React, { Component } from 'react'
import store from '../store'

class Org extends Component {

  constructor(props) {
    super(props)

    this.state = {
      employees: []
    }
  }

  componentWillMount() {
    // get contract and user from app state
    const state = store.getState()
    const contract = state.contract
    const user = state.user

    // get employees
    contract.methods.getEmployees().call({from: user.address}).then(result => {
      result.forEach(e => {
        contract.methods.employees(e).call((e, result) => {
          if (!e && result[0]) {
            const arr = this.state.employees.slice();
            arr.push({
              name: result[0],
              email: result[1],
              city: result[2],
              passport: Number(result[3]),
              profession: result[4]
            });
            this.setState({
              employees: arr
            });
          }
        });
      });
    })
  }

  render() {
    let employees;

    if (this.state.employees && this.state.employees.length !== 0) {
      employees = <div>
        <h3>Ваши сотрудники</h3>
        <ul> {
          this.state.employees.map((e) =>
          <li key={e.email}>
            <p>{e.name}, {e.email}, {e.profession}, {e.city}, {e.passport}</p>
          </li>)
        } </ul>
      </div>
    }

    const user = store.getState().user
    return (
      <div>
        <h2>Профиль вашей организации</h2>
        <p><i>Название:</i> {user.name}</p>
        <p><i>Город:</i> {user.city}</p>
        <p><i>Инн:</i> {user.inn}</p>
        <p><i>Сфера деятельности:</i> {user.sphere}</p>
        {employees}
      </div>
    );
  }
}

export default Org

import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import store from '../store';

class Org extends Component {

  constructor(props) {
    super(props)

    this.state = {
      staff: [],
      employees: []
    }
  }

  componentWillMount() {
    // get contract and user from app state
    const state = store.getState()
    const contract = state.contract
    const user = state.user

    // get staff
    contract.methods.getStaff().call({from: user.address}).then(staff => {
      // get information about every staff member
      staff.forEach(e => {
        contract.methods.employeeInfo(e).call((e, result) => {
          if (!e && result[0]) {
            const arr = this.state.staff.slice();
            arr.push({
              name: result[0],
              email: result[1],
              city: result[2],
              passport: Number(result[3]),
              profession: result[4]
            });
            this.setState({
              staff: arr
            });
          }
        });
      });

      // get information about other employees
      contract.methods.getEmployees().call().then(employees => {
        employees.filter(e => !staff.includes(e)).forEach(emp => {
          contract.methods.employeeInfo(emp).call((e, result) => {
            if (!e && result) {
              const arr = this.state.employees.slice();
              arr.push({
                name: result[0],
                email: result[1],
                city: result[2],
                passport: Number(result[3]),
                profession: result[4],
                address: emp
              });
              this.setState({
                employees: arr
              });
            }
          });
        });
      });
    })
  }

  render() {
    let staff, employees;

    if (this.state.staff && this.state.staff.length > 0) {
      staff = <div>
        <h3>Ваши сотрудники:</h3>
        <ul> {
          this.state.staff.map((e) =>
          <li key={e.email}>
            <p>{e.name}, {e.email}, {e.profession}, {e.city}, {e.passport}</p>
          </li>)
        } </ul>
      </div>
    }

    if (this.state.employees && this.state.employees.length > 0) {
      employees = <div>
        <h3>Профессионалы:</h3>
        <ul> {
          this.state.employees.map((e) =>
          <li key={e.email}>
            <p>{e.name}, {e.email}, {e.profession}, {e.city}, {e.passport}</p>
            <Button onClick={makeOffer.bind(this, e.address)}>
              Сделать предложение о работе
            </Button>
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
        {staff}
        {employees}
      </div>
    );
  }
}

function makeOffer(address) {
  const state = store.getState();
  //TODO get position from user input
  state.contract.methods.makeOffer(address, 'Developer')
    .send({from: state.user.address}, (e, result) => {});
}

export default Org

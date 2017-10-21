import React, { Component } from 'react'
import { Jumbotron, Button } from 'react-bootstrap';

import NewEmployee from './new_employee';
import NewOrg from './new_org';

class Auth extends Component {

  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    let body;

    if (this.state.child) {
      body = this.state.child;
    } else {
      body = <div>
        <Button onClick={handleOrg.bind(this)}>
          Я представляю организацию
        </Button>
        <Button onClick={handleEmployee.bind(this)}>
          Я представляю себя самого
        </Button>
      </div>
    }

    return (
      <Jumbotron>
        <h1>Welcome!</h1>
        <p>У вас еще нет аккаунта в нашем сервисе. Создайте же его!</p>
        {body}
      </Jumbotron>
    );
  }
}

function handleOrg(event) {
  this.setState({
    child: <NewOrg web3={this.props.web3}/>
  });
}

function handleEmployee(event) {
  this.setState({
    child: <NewEmployee web3={this.props.web3}/>
  });
}

export default Auth

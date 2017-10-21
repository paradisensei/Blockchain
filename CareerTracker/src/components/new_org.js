import React, { Component } from 'react'
import store from '../store'

import { Button, Form, FormGroup, FormControl } from 'react-bootstrap';

class NewOrg extends Component {

  constructor(props) {
    super(props)

    this.handleInputChange = handleInputChange.bind(this);
    this.handleSubmit = handleSubmit.bind(this);
  }

  render() {
    return (
      <Form inline>
        <FormGroup>
          <FormControl name='name' type="text" placeholder="Название:"
            onChange={this.handleInputChange}/>
          <FormControl name='city' type="text" placeholder="Город:"
            onChange={this.handleInputChange}/>
          <FormControl name='inn' type="number" placeholder="ИНН:"
            onChange={this.handleInputChange}/>
          <FormControl name='sphere' type="text" placeholder="Сфера деятельности:"
            onChange={this.handleInputChange}/>
          <Button onClick={this.handleSubmit}>Submit</Button>
        </FormGroup>
      </Form>
    );
  }
}

function handleInputChange(event) {
  this.setState({
    [event.target.name]: event.target.value
  });
}

function handleSubmit() {
  const state = store.getState();
  this.props.web3.eth.getAccounts().then(accounts => {
    state.contract.methods.newOrg(...Object.values(this.state))
    .send({from: accounts[0]}, (e, result) => {});
  });
}

export default NewOrg

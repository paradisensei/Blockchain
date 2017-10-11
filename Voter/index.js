#!/usr/bin/env node

"use strict";

// import dependencies
const Web3 = require('web3');
const program = require('commander');
const fs = require('fs');
const clear = require('clear');

// import user inquiries
const inquiries = require('./lib/inquiries');

// contract's ABI and address on the deployed network
const contractInfo = require('./contract/VotingInfo.json');

// clear the terminal window
clear();

const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");

program
  .version('1.0.0')
  .description('CLI for interacting with the "Voter" smart contract');

program
  .command('init <UTC-file> <password>')
  .alias('i')
  .description('Provide your keystore to interact with the contract')
  .action((utc, password) => {
    fs.readFile(utc, 'utf8', function (err, data) {
      if (!err) {
        // get account from UTC-file
        const account = web3.eth.accounts.decrypt(data, password);
        // add user account to the wallet
        web3.eth.accounts.wallet.add(account);
        // use user account as default for signing transactions
        web3.eth.defaultAccount = account.address;
        
        // instantiate contract
        const contract = new web3.eth
                .Contract(contractInfo.abi, contractInfo.address);
        
        //check whether user is owner or voter
        contract.methods.isOwner().call().then((res) => {
          if (res) {
            inquiries.ownerInquiries(contract, account, web3.utils);
          } else {
            inquiries.voterInquiries(contract, account, web3.utils);
          }
        });
      } else {
        console.log('Something went wrong, please, try again');
      }
    });
  });

program.parse(process.argv);
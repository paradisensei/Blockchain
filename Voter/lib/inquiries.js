const inquirer = require('inquirer');

module.exports = {
  // owner interface
  ownerInquiries: (contract, account, utils) => {
    const question = {
      name: 'method',
      type: 'list',
      message: 'Choose method to call:',
      choices: ['getProposals', 'newProposal', 'finishProposal', 'exit']
    };
    promptOwner(question, contract, account, utils);
  },

  // voter interface
  voterInquiries: (contract, account, utils) => {
    const question = {
      name: 'method',
      type: 'list',
      message: 'Choose method to call:',
      choices: ['getProposals', 'vote', 'exit']
    }
    promptVoter(question, contract, account, utils);
  }
};

const promptOwner = (question, contract, account, utils) => {
  inquirer.prompt(question).then((ans) => {
    switch (ans.method) {
      case 'getProposals':
        contract.methods.getProposals().call().then((res) => {
          printProposals(res, utils);
          promptOwner(question, contract, account, utils);
        });
        break;
      case 'newProposal':
        var q = {
          name: 'description',
          type: 'input',
          message: 'New proposal\'s description:',
          validate: function(value) {
            return value.length ? true
                      : 'Please enter new proposal\'s description';
          }
        };
        inquirer.prompt(q).then((ans) => {
          contract.methods.newProposal(ans.description)
            .send({from: account.address, gas: 80000}).then((res) => {
              promptOwner(question, contract, account, utils);
            });
        });
        break;
      case 'finishProposal':
        var q = {
          name: 'proposal',
          type: 'input',
          message: 'Index of proposal:',
          validate: function(value) {
            return value.length ? true : 'Please enter proposal\'s index';
          }
        };
        inquirer.prompt(q).then((ans) => {
          contract.methods.finishProposal(ans.proposal)
            .send({from: account.address, gas: 80000}).then((res) => {
              promptOwner(question, contract, account, utils);
            });
        });
        break;
      default:
        console.log('Goodbye!');
    }
  });
}

const promptVoter = (question, contract, account, utils) => {
  inquirer.prompt(question).then((ans) => {
    switch (ans.method) {
      case 'getProposals':
        contract.methods.getProposals().call().then((res) => {
          printProposals(res, utils);
          promptVoter(question, contract, account, utils);
        });
        break;
      case 'vote':
        const q = [
          {
            name: 'proposal',
            type: 'input',
            message: 'Index of proposal:',
            validate: function(value) {
              return value.length ? true : 'Please enter proposal\'s index';
            }
          }, {
            name: 'approve',
            type: 'confirm',
            message: 'Vote for proposal:'
          }
        ]
        inquirer.prompt(q).then((ans) => {
          contract.methods.vote(ans.proposal, ans.approve)
            .send({from: account.address, gas: 80000})
              .then((res) => {
                promptVoter(question, contract, account, utils);
              })
              .catch((e) => {
                console.log('You can`t vote more than once');
                promptVoter(question, contract, account, utils);
              });
        });
        break;
      default:
        console.log('Goodbye!');
    }
  });
}

printProposals = (res, utils) => {
  let i = 0;
  res[0].forEach((p) => {
    // show votes only if proposal is over
    let votes = '';
    if (!res[1][i]) {
      votes = '. votes for = ' + res[2][i] + 
              ' , against = ' + res[3][i];
    }
    const descr = utils.hexToAscii(p).replace(/\0/g, '');
    console.log(i++ + ') ' + descr + votes);
  });
}
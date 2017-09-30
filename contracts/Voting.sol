pragma solidity ^0.4.15;

contract Owned {
    address public owner;

    function Owned() {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
}

//* @title Voting on proposals. */
contract Voting is Owned {
    // This is a type for a single proposal.
    struct Proposal {
        string description; // proposal's comprehensive description
        bool active; // whether proposal is active or not
        uint countFor; // number of votes 'for' proposal
        uint countAgainst; // number of votes 'against' proposal
    }

    // This is a type for a single vote.
    struct Vote {
        address voter; // voted user's address
        bool approve; // 'True' if vote is for proposal, 'False' otherwise
    }

    // This declares a state variable that
    // stores an array of `Vote` structs for each proposal.
    mapping(uint => Vote[]) public votes;

    // A dynamically-sized array of `Proposal` structs.
    Proposal[] public proposals;

    /// Create a new voting contract to vote of different proposals.
    function Voting() {
        owner = msg.sender;
    }

    function getLastProposalIndex() constant returns (uint) {
        return proposals.length - 1;
    }

    /// Give your vote to the particular proposal.
    function vote(uint proposal, bool _approve) {
        require(proposals[proposal].active);

        Vote[] storage _votes = votes[proposal];
        for (uint i = 0; i < _votes.length; i++) {
            require(_votes[i].voter != msg.sender);
        }

        _votes.push(Vote({
            voter: msg.sender,
            approve: _approve
        }));
    }

    function newProposal(string _description) onlyOwner {
        proposals.push(Proposal({
            description: _description,
            active: true,
            countFor: 0,
            countAgainst: 0
        }));
    }

    function removeProposal(uint proposal) onlyOwner {
        delete proposals[proposal];
        delete votes[proposal];
    }

    function finishProposal(uint proposal) onlyOwner returns (bool) {
        // stop accepting votes on proposal
        Proposal storage prop = proposals[proposal];
        prop.active = false;
        
        // count votes for & against
        Vote[] memory _votes = votes[proposal];
        uint _countFor = 0;
        uint _countAgainst = 0;
        for (uint p = 0; p < _votes.length; p++) {
            if (_votes[p].approve) {
                _countFor++;
            } else {
                _countAgainst++;
            }
        }
        
        // save vote's results
        prop.countFor = _countFor;
        prop.countAgainst = _countAgainst;

        // returns 'True' if proposal is accepted, 'False' otherwise
        return _countFor > _countAgainst;
    }
}
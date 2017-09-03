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

    function transferOwnership(address newOwner) onlyOwner {
        owner = newOwner;
    }
}

//* @title Gambling machine. */
contract Gambling is Owned {
    // This enum represents possible outcomes.
    enum Outcome { NO, WIN, LOSS, DRAW }

    // This is a type for a single event.
    struct Event {
        uint startTime; // absolute unix timestamp
        Outcome outcome;
        string firstTeamName;
        string secondTeamName;
        //TODO add coef. of diff. outcomes
    }

    // This is a type for a single bet on a particular event.
    struct Bet {
        uint eventIndex; // index of the event
        Outcome outcome; // predicted outcome of the event
        uint amount; // bet amount in ether
    }

    // This declares a state variable that
    // stores a `Bet` struct for each possible address.
    //TODO Bet => Bet[]
    mapping (address => Bet) public bets;

    // A dynamically-sized array of `Event` structs.
    Event[] public events;
    
    /// Create a new gambling machine.
    function Gambling() {
        owner = msg.sender;
    }

    /// Add new event
    function addEvent(
        uint _startTime,
        string _firstTeamName, 
        string _secondTeamName
    )
        onlyOwner
    {
        events.push(Event({
            startTime: _startTime,
            outcome: Outcome.NO,
            firstTeamName: _firstTeamName,
            secondTeamName: _secondTeamName
        }));    
    }

    /// Bet on particular event
    function bet(uint eventIndex, uint outcome) payable {
        require(now <= events[eventIndex].startTime);
        bets[msg.sender] = Bet({
            eventIndex: eventIndex,
            outcome: Outcome(outcome),
            amount: msg.value
        });
    }
}
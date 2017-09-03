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

//* @title Driving license manager */
contract DrivingLicense is Owned {
    // This is a type for a single driver.
    struct Driver {
        string firstName;
        string lastName;
        uint passport;
        bool exists;
    }

    // This is a type for a single driving license.
    struct License {
        uint dateGiven; // absolute unix timestamp
        uint dateFrozen; // absolute unix timestamp
        uint dateUnfrozen; // absolute unix timestamp
        string category;
        bool frozen; // whether license is active or frozen
        bool exists;
    }

    // This declares a state variable that
    // stores a `Driver` struct for each possible address.
    mapping (address => Driver) public driver;

    // This declares a state variable that
    // stores a 'License' struct for each possible address.
    mapping (address => License) public license;
    
    /// Create a new driving license management contract.
    function DrivingLicense() {
        owner = msg.sender;
    }

    /// Apply for the driving license.
    function apply(string _firstName, string _lastName, uint _passport) {
        require(!driver[msg.sender].exists);
        driver[msg.sender] = Driver({
            firstName: _firstName,
            lastName: _lastName,
            passport: _passport,
            exists: true
        });
    }

    /// Approve one`s application for the driving license.
    function approve(address driverAddr, string _category) onlyOwner {
        require(driver[driverAddr].exists && !license[driverAddr].exists);
        license[driverAddr] = License({
            dateGiven: now,
            dateFrozen: 0,
            dateUnfrozen: 0,
            category: _category,
            frozen: false,
            exists: true
        });
    }

    /// Freeze one`s driving license.
    function freezeLicense(address driverAddr) onlyOwner {
        require(license[driverAddr].exists && !license[driverAddr].frozen);
        License storage driverLicense = license[driverAddr];
        driverLicense.dateFrozen = now;
        driverLicense.frozen = true;
    }

    /// Unfreeze one`s driving license.
    function unfreezeLicense(address driverAddr) onlyOwner {
        require(license[driverAddr].frozen);
        License storage driverLicense = license[driverAddr];
        driverLicense.dateUnfrozen = now;
        driverLicense.frozen = false;
    }
}
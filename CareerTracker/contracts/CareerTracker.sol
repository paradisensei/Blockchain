pragma solidity ^0.4.15;

//* @title A contract to track careers. */
contract CareerTracker {

    // This is a type for a single employee.
    struct Employee {
        string name;
        string email;
        string position;
        string city;
        uint32 passport;
    }

    // This is a type for a single organization.
    struct Org {
        string name;
        string city;
        string sphere;
    }

    // This is a type for a single offer.
    struct Offer {
        address organization;
        string position;
        uint timestamp;
        OfferStatus status;
    }

    enum OfferStatus { No, Approved, Declined }

    // This is a type for a single employment record.
    struct EmpRecord {
        address organization;
        string position;
        uint timestamp;
        EmploymentStatus status;
    }

    enum EmploymentStatus { In, Out, Fired }

    mapping (address => Employee) public employees;
    mapping (address => Org) public orgs;

    // employee address -> employee's offers
    mapping (address => Offer[]) public offersOf;

    // employee address -> employee's employment history
    mapping (address => EmpRecord[]) public empHistoryOf;

    // organization address -> list of employees
    mapping (address => address[]) public employeesOf;

    /// Add new employee
    function newEmployee(
        string _name,
        string _email,
        string _position,
        string _city,
        uint32 _passport
    ) 
        public 
    {
        require(keccak256(_email) != keccak256(employees[msg.sender].email));
        employees[msg.sender] = Employee({
            name: _name,
            email : _email,
            position: _position,
            city: _city,
            passport: _passport
        });
    }

    /// Add new organization
    function newOrg(string _name, string _city, string _sphere) public {
        require(keccak256(_name) != keccak256(orgs[msg.sender].name));
        orgs[msg.sender] = Org({
            name: _name,
            city: _city,
            sphere: _sphere
        });
    }
    
    /// Get all offers with 'No' status 
    function getNewOffers() 
        public
        constant 
        returns (address[], bytes32[], uint[])
    {
        uint len = offersOf[msg.sender].length;
        address[] memory orgs = new address[](len);
        bytes32[] memory positions = new bytes32[](len);
        uint[] memory timestamps = new uint[](len);
        
        for (uint i = 0; i < len; i++) {
            Offer memory offer = offersOf[msg.sender][i];
            if (offer.status == OfferStatus.No) {
                string memory position = offer.position;
                bytes32 pos;
                assembly {
                    pos := mload(add(position, 32))
                }
                orgs[i] = offer.organization;
                positions[i] = pos;
                timestamps[i] = offer.timestamp;
            }
        }
        return (orgs, positions, timestamps);
    }
    
    function getOffersLength() public constant returns(uint) {
        return offersOf[msg.sender].length;
    }

    /// Make an offer to particular employee
    function offer(address employee, string _position) public {
        address[] memory empls = employeesOf[msg.sender];
        for (uint i = 0; i < empls.length; i++) {
            require(empls[i] != employee);
        }
        offersOf[employee].push(Offer({
            organization: msg.sender,
            position: _position,
            timestamp: now,
            status: OfferStatus.No
        }));
    }

    /// Make a decision on offer 
    function considerOffer(uint offerIdx, bool approve) public {
        Offer storage _offer = offersOf[msg.sender][offerIdx];
        if (approve) {
            _offer.status = OfferStatus.Approved;
            empHistoryOf[msg.sender].push(EmpRecord({
                organization: _offer.organization,
                position: _offer.position,
                timestamp: now,
                status: EmploymentStatus.In
            }));
            employeesOf[_offer.organization].push(msg.sender);
        } else {
            _offer.status = OfferStatus.Declined;
        }
    }

    // returns 0x0 if person is unemployed
    function getCurrentEmployer() public constant returns (address) {
        require(empHistoryOf[msg.sender].length > 0);
        uint last = empHistoryOf[msg.sender].length - 1;
        EmpRecord memory lastRecord = empHistoryOf[msg.sender][last];

        if (lastRecord.status != EmploymentStatus.In) {
            return address(0);
        } else {
            return lastRecord.organization;
        }
    }

    function getEmployees() public constant returns (address[]) {
        return employeesOf[msg.sender];
    }

    // TODO
    // function getEmploymentHistory() constant returns (uint[]) {
    //     EmpRecord[] memory records = empHistoryOf[msg.sender];
    //     uint[] memory result = new uint[](records.length * 3);

    //     for (uint i = 0; i < records.length; i++) {
    //         uint index = i * 3;
    //         //TODO convert address to smth reternable
    //         result[index] = uint(records[i].organization);
    //         result[index + 1] = records[i].dateCreated;
    //         result[index + 2] = uint(records[i].status);
    //     }

    //     return result;
    // }
}
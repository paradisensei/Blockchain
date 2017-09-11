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
        bool approved;
    }

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
    ) {
        require(sha3(_email) != sha3(employees[msg.sender].email));
        employees[msg.sender] = Employee({
            name: _name,
            email : _email,
            position: _position,
            city: _city,
            passport: _passport
        });
    }

    /// Add new organization
    function newOrg(string _name, string _city, string _sphere) {
        require(sha3(_name) != sha3(orgs[msg.sender].name));
        orgs[msg.sender] = Org({
            name: _name,
            city: _city,
            sphere: _sphere
        });
    }

    /// Make an offer to particular employee
    function offer(address employee, string _position) {
        address[] memory empls = employeesOf[msg.sender];
        for (uint i = 0; i < empls.length; i++) {
            require(empls[i] != employee);
        }
        offersOf[employee].push(Offer({
            organization: msg.sender,
            position: _position,
            timestamp: now,
            approved: false
        }));
    }

    /// Make a decision on offer 
    function considerOffer(uint offerIdx, bool approve) {
        Offer storage _offer = offersOf[msg.sender][offerIdx];
        if (approve) {
            _offer.approved = true;
            empHistoryOf[msg.sender].push(EmpRecord({
                organization: _offer.organization,
                position: _offer.position,
                timestamp: now,
                status: EmploymentStatus.In
            }));
            employeesOf[_offer.organization].push(msg.sender);
        } else {
            _offer.approved = false;
        }
    }

    // returns address(0) if person is unemployed
    function getCurrentEmployer() constant returns (address) {
        uint last = empHistoryOf[msg.sender].length - 1;
        EmpRecord memory lastRecord = empHistoryOf[msg.sender][last];

        if (lastRecord.status != EmploymentStatus.In) {
            return address(0);
        } else {
            return lastRecord.organization;
        }
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
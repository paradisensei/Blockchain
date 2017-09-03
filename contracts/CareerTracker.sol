pragma solidity ^0.4.15;

//* @title A contract to track careers. */
contract CareerTracker {

    // This is a type for a single employee.
    struct Employee {
        string name;
        string email;
        string position;
        string city;
    }

    // This is a type for a single organization.
    struct Org {
        string name;
        string sphere;
    }

    // This is a type for a single offer.
    struct Offer {
        address organization;
        bool approved;
    }

    // This is a type for a single employment record.
    struct EmpRecord {
        address organization;
        uint dateCreated;
        EmploymentStatus status;
    }

    mapping (address => Employee) public employees;
    mapping (address => Org) public orgs;

    // employee address -> employee's offers
    mapping (address => Offer[]) public offersOf;

    // employee address -> employee's employment history
    mapping (address => EmpRecord[]) public empHistoryOf;

    // organization address -> list of employees
    mapping (address => address[]) public employeesOf;

    enum EmploymentStatus { In, Out, Fired }

    /// Add new employee
    function newEmployee(
        string _name,
        string _email,
        string _position,
        string _city
    ) {
        require(sha3(_email) != sha3(employees[msg.sender].email));
        employees[msg.sender] = Employee({
            name: _name,
            email : _email,
            position: _position,
            city: _city
        });
    }

    /// Add new organization
    function newOrg(string _name, string _sphere) {
        require(sha3(_name) != sha3(orgs[msg.sender].name));
        orgs[msg.sender] = Org({
            name: _name,
            sphere: _sphere
        });
    }

    /// Make an offer to particular employee
    function offer(address employee) {
        address[] memory empls = employeesOf[msg.sender];
        for (uint i = 0; i < empls.length; i++) {
            require(empls[i] != employee);
        }
        offersOf[employee].push(Offer({
            organization: msg.sender,
            approved: false
        }));
    }

    /// Make a decision on offer 
    function considerOffer(uint offerIdx, bool approve) {
        if (approve) {
            address org = offersOf[msg.sender][offerIdx].organization;
            empHistoryOf[msg.sender].push(EmpRecord({
                organization: org,
                dateCreated: now,
                status: EmploymentStatus.In
            }));
            employeesOf[org].push(msg.sender);
        } else {
            delete offersOf[msg.sender][offerIdx];
        }
    }

    // returns -1 if person is unemployed
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
pragma solidity ^0.4.15;

//* @title A contract to track career. */
contract CareerTracker {

    // This is a type for a single employee.
    struct Employee {
        string name;
        string email;
        string city;
        uint32 passport;
        string profession;
    }

    // This is a type for a single organization.
    struct Org {
        string name;
        string city;
        uint32 inn;
        string sphere;
    }

    // This is a type for a single offer.
    struct Offer {
        address org;
        string position;
        uint timestamp;
        OfferStatus status;
    }

    enum OfferStatus { No, Approved, Declined }

    // This is a type for a single employment record.
    struct EmpRecord {
        address org;
        string position;
        uint timestamp;
        EmploymentStatus status;
    }

    enum EmploymentStatus { In, Out, Fired }

    // employee's address -> employee's information
    mapping (address => Employee) public employeeInfo;
    // A dynamically-sized array containing employees' addresses
    address[] public employees;

    // organization's address -> organization's information
    mapping (address => Org) public orgInfo;
    // A dynamically-sized array containing organizations' addresses
    address[] public orgs;

    // employee address -> employee's offers
    mapping (address => Offer[]) public offersOf;

    // employee address -> employee's employment history
    mapping (address => EmpRecord[]) public empRecordsOf;

    // organization address -> organization's employees
    mapping (address => address[]) public employeesOf;

    //TODO verify employee's identity
    /// Add new employee
    function newEmployee(
        string _name,
        string _email,
        string _city,
        uint32 _passport,
        string _profession
    )
        public
    {
        require(employeeInfo[msg.sender].passport == 0);

        employeeInfo[msg.sender] = Employee({
            name: _name,
            email: _email,
            city: _city,
            passport: _passport,
            profession: _profession
        });
        employees.push(msg.sender);
    }

    //TODO verify organization's identity
    /// Add new organization
    function newOrg(
        string _name,
        string _city,
        uint32 _inn,
        string _sphere
    )
        public
    {
        require(orgInfo[msg.sender].inn == 0);

        orgInfo[msg.sender] = Org({
            name: _name,
            city: _city,
            inn: _inn,
            sphere: _sphere
        });
        orgs.push(msg.sender);
    }

    /// Make an offer to particular employee
    function makeOffer(address employee, string position) public {
        address[] memory empls = employeesOf[msg.sender];
        for (uint i = 0; i < empls.length; i++) {
            require(empls[i] != employee);
        }
        offersOf[employee].push(Offer({
            org: msg.sender,
            position: position,
            timestamp: now,
            status: OfferStatus.No
        }));
    }

    /// Make a decision on particular offer
    function considerOffer(uint index, bool approve) public {
        Offer storage offer = offersOf[msg.sender][index];
        if (approve) {
            EmpRecord[] memory records = empRecordsOf[msg.sender];

            // can accept offer only if unemployed
            uint len = records.length;
            if (len > 0) {
              require(records[len - 1].status != EmploymentStatus.In);
            }

            offer.status = OfferStatus.Approved;
            empRecordsOf[msg.sender].push(EmpRecord({
                org: offer.org,
                position: offer.position,
                timestamp: now,
                status: EmploymentStatus.In
            }));
            employeesOf[offer.org].push(msg.sender);
        } else {
            offer.status = OfferStatus.Declined;
        }
    }

    /// Get current employer
    function getCurrentEmployer() public constant returns (address) {
        uint last = empRecordsOf[msg.sender].length - 1;
        EmpRecord memory lastRecord = empRecordsOf[msg.sender][last];

        if (lastRecord.status != EmploymentStatus.In) {
            return address(0);
        } else {
            return lastRecord.org;
        }
    }

    /// Get organization's employees' addresses
    function getStaff() public constant returns (address[]) {
        return employeesOf[msg.sender];
    }

    /// Get other employees' addresses
    function getEmployees() public constant returns (address[]) {
        return employees;
    }

    /// Get organizations' addresses
    function getOrgs() public constant returns (address[]) {
        return orgs;
    }

    /// Get offers count
    function getOffersCount() public constant returns(uint) {
        return offersOf[msg.sender].length;
    }

    /// Get employment records count
    function getEmpRecordsCount() public constant returns(uint) {
        return empRecordsOf[msg.sender].length;
    }

}

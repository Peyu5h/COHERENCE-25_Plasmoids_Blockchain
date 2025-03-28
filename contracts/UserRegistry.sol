// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract UserRegistry {
    enum Role {
        None,
        User,
        Authority,
        Verifier,
        Admin
    }

    enum CertificateType {
        Income,
        Address,
        Identity,
        Education,
        Employment,
        Other
    }

    struct UserData {
        string name;
        string dob;
        string gender;
        string physicalAddress;
        string mobileNumber;
        Role role;
        bool isVerified;
        bool exists;
    }

    struct Certificate {
        address userAddress;
        address authorityAddress;
        string certificateId;
        string issuanceDate;
        string ipfsHash;
        string metadataHash;
        CertificateType certificateType;
        bool isVerified;
        uint256 timestamp;
    }

    address public admin;
    mapping(address => UserData) public users;
    address[] public userAddresses;
    address[] public pendingAuthorities;

    mapping(address => Certificate[]) public userCertificates;
    mapping(address => Certificate[]) public pendingCertificates;

    mapping(address => string) public authorityDepartment;
    mapping(address => string) public authorityLocation;

    event UserRegistered(address indexed userAddress, string name, Role role);
    event AuthorityVerified(address indexed authorityAddress, string name);
    event UserPromoted(
        address indexed userAddress,
        Role previousRole,
        Role newRole
    );
    event CertificateRequested(
        address indexed userAddress,
        address indexed authorityAddress,
        string certificateId,
        CertificateType certificateType
    );
    event CertificateVerified(
        address indexed userAddress,
        address indexed authorityAddress,
        string certificateId,
        CertificateType certificateType
    );
    event CertificateRejected(
        address indexed userAddress,
        address indexed authorityAddress,
        string certificateId,
        string reason
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier userExists() {
        require(users[msg.sender].exists, "User not found");
        _;
    }

    modifier onlyAuthority() {
        require(
            users[msg.sender].exists &&
                users[msg.sender].role == Role.Authority,
            "Not authority"
        );
        _;
    }

    modifier onlyVerifier() {
        require(
            users[msg.sender].exists && users[msg.sender].role == Role.Verifier,
            "Not verifier"
        );
        _;
    }

    constructor() {
        admin = msg.sender;
        users[msg.sender] = UserData({
            name: "Admin",
            dob: "",
            gender: "",
            physicalAddress: "",
            mobileNumber: "",
            role: Role.Admin,
            isVerified: true,
            exists: true
        });
        userAddresses.push(msg.sender);
    }

    function registerUser(
        string memory _name,
        string memory _dob,
        string memory _gender,
        string memory _physicalAddress,
        string memory _mobileNumber
    ) external {
        require(!users[msg.sender].exists, "Already registered");

        users[msg.sender] = UserData({
            name: _name,
            dob: _dob,
            gender: _gender,
            physicalAddress: _physicalAddress,
            mobileNumber: _mobileNumber,
            role: Role.User,
            isVerified: true,
            exists: true
        });

        userAddresses.push(msg.sender);
        emit UserRegistered(msg.sender, _name, Role.User);
    }

    function registerAuthority(
        string memory _name,
        string memory _dob,
        string memory _gender,
        string memory _physicalAddress,
        string memory _mobileNumber
    ) external {
        require(!users[msg.sender].exists, "Already registered");

        users[msg.sender] = UserData({
            name: _name,
            dob: _dob,
            gender: _gender,
            physicalAddress: _physicalAddress,
            mobileNumber: _mobileNumber,
            role: Role.Authority,
            isVerified: true,
            exists: true
        });

        userAddresses.push(msg.sender);
        emit UserRegistered(msg.sender, _name, Role.Authority);
    }

    function updateAuthorityDetails(
        string memory _department,
        string memory _location
    ) external onlyAuthority {
        authorityDepartment[msg.sender] = _department;
        authorityLocation[msg.sender] = _location;
    }

    function registerVerifier(
        string memory _name,
        string memory _dob,
        string memory _gender,
        string memory _physicalAddress,
        string memory _mobileNumber
    ) external {
        require(!users[msg.sender].exists, "Already registered");

        users[msg.sender] = UserData({
            name: _name,
            dob: _dob,
            gender: _gender,
            physicalAddress: _physicalAddress,
            mobileNumber: _mobileNumber,
            role: Role.Verifier,
            isVerified: true,
            exists: true
        });

        userAddresses.push(msg.sender);
        emit UserRegistered(msg.sender, _name, Role.Verifier);
    }

    function requestCertificate(
        address _authorityAddress,
        string memory _certificateId,
        string memory _issuanceDate,
        string memory _ipfsHash,
        string memory _metadataHash,
        CertificateType _certificateType
    ) external userExists {
        require(
            users[_authorityAddress].exists &&
                users[_authorityAddress].role == Role.Authority,
            "Invalid authority"
        );

        Certificate memory newCertificate = Certificate({
            userAddress: msg.sender,
            authorityAddress: _authorityAddress,
            certificateId: _certificateId,
            issuanceDate: _issuanceDate,
            ipfsHash: _ipfsHash,
            metadataHash: _metadataHash,
            certificateType: _certificateType,
            isVerified: false,
            timestamp: block.timestamp
        });

        pendingCertificates[_authorityAddress].push(newCertificate);

        emit CertificateRequested(
            msg.sender,
            _authorityAddress,
            _certificateId,
            _certificateType
        );
    }

    function verifyCertificate(
        address _userAddress,
        string memory _certificateId
    ) external onlyAuthority {
        Certificate[] storage pendingCerts = pendingCertificates[msg.sender];
        bool found = false;
        uint256 index;

        for (uint i = 0; i < pendingCerts.length; i++) {
            if (
                pendingCerts[i].userAddress == _userAddress &&
                keccak256(bytes(pendingCerts[i].certificateId)) ==
                keccak256(bytes(_certificateId))
            ) {
                found = true;
                index = i;
                break;
            }
        }

        require(found, "Cert not found");

        Certificate memory verifiedCert = pendingCerts[index];
        verifiedCert.isVerified = true;

        //adding user's certificate
        userCertificates[_userAddress].push(verifiedCert);

        // removing from pending list
        if (index < pendingCerts.length - 1) {
            pendingCerts[index] = pendingCerts[pendingCerts.length - 1];
        }
        pendingCerts.pop();

        emit CertificateVerified(
            _userAddress,
            msg.sender,
            _certificateId,
            verifiedCert.certificateType
        );
    }

    function rejectCertificate(
        address _userAddress,
        string memory _certificateId,
        string memory _reason
    ) external onlyAuthority {
        Certificate[] storage pendingCerts = pendingCertificates[msg.sender];
        bool found = false;
        uint256 index;

        for (uint i = 0; i < pendingCerts.length; i++) {
            if (
                pendingCerts[i].userAddress == _userAddress &&
                keccak256(bytes(pendingCerts[i].certificateId)) ==
                keccak256(bytes(_certificateId))
            ) {
                found = true;
                index = i;
                break;
            }
        }

        require(found, "Cert not found");

        if (index < pendingCerts.length - 1) {
            pendingCerts[index] = pendingCerts[pendingCerts.length - 1];
        }
        pendingCerts.pop();

        emit CertificateRejected(
            _userAddress,
            msg.sender,
            _certificateId,
            _reason
        );
    }

    function promoteUser(
        address _userAddress,
        Role _newRole
    ) external onlyAdmin {
        require(users[_userAddress].exists, "User not found");
        require(
            users[_userAddress].role < _newRole,
            "User has equal/higher role"
        );

        Role previousRole = users[_userAddress].role;
        users[_userAddress].role = _newRole;

        emit UserPromoted(_userAddress, previousRole, _newRole);
    }

    function approveAuthority(address _authorityAddress) external onlyAdmin {
        require(users[_authorityAddress].exists, "Auth not found");
        require(
            users[_authorityAddress].role == Role.Authority,
            "Not authority"
        );
        require(!users[_authorityAddress].isVerified, "Already verified");

        users[_authorityAddress].isVerified = true;

        //removing from pending list
        for (uint i = 0; i < pendingAuthorities.length; i++) {
            if (pendingAuthorities[i] == _authorityAddress) {
                pendingAuthorities[i] = pendingAuthorities[
                    pendingAuthorities.length - 1
                ];
                pendingAuthorities.pop();
                break;
            }
        }

        emit AuthorityVerified(
            _authorityAddress,
            users[_authorityAddress].name
        );
    }

    function getUserData(
        address _userAddress
    )
        external
        view
        returns (
            string memory name,
            string memory dob,
            string memory gender,
            string memory physicalAddress,
            string memory mobileNumber,
            Role role,
            bool isVerified
        )
    {
        require(users[_userAddress].exists, "User not found");
        UserData memory userData = users[_userAddress];

        return (
            userData.name,
            userData.dob,
            userData.gender,
            userData.physicalAddress,
            userData.mobileNumber,
            userData.role,
            userData.isVerified
        );
    }

    function getCurrentUserData()
        external
        view
        userExists
        returns (
            string memory name,
            string memory dob,
            string memory gender,
            string memory physicalAddress,
            string memory mobileNumber,
            Role role,
            bool isVerified
        )
    {
        UserData memory userData = users[msg.sender];

        return (
            userData.name,
            userData.dob,
            userData.gender,
            userData.physicalAddress,
            userData.mobileNumber,
            userData.role,
            userData.isVerified
        );
    }

    function getUserCertificates(
        address _userAddress
    ) external view returns (Certificate[] memory) {
        return userCertificates[_userAddress];
    }

    function getPendingCertificates()
        external
        view
        onlyAuthority
        returns (Certificate[] memory)
    {
        return pendingCertificates[msg.sender];
    }

    function getAuthorityDetails(
        address _authorityAddress
    )
        external
        view
        returns (
            string memory name,
            string memory department,
            string memory location,
            bool isVerified
        )
    {
        require(
            users[_authorityAddress].exists &&
                users[_authorityAddress].role == Role.Authority,
            "Not valid authority"
        );

        return (
            users[_authorityAddress].name,
            authorityDepartment[_authorityAddress],
            authorityLocation[_authorityAddress],
            users[_authorityAddress].isVerified
        );
    }

    function searchAuthorities() external view returns (address[] memory) {
        uint validAuthorityCount = 0;

        for (uint i = 0; i < userAddresses.length; i++) {
            address addr = userAddresses[i];
            if (users[addr].role == Role.Authority && users[addr].isVerified) {
                validAuthorityCount++;
            }
        }

        address[] memory result = new address[](validAuthorityCount);
        uint resultIndex = 0;

        for (
            uint i = 0;
            i < userAddresses.length && resultIndex < validAuthorityCount;
            i++
        ) {
            address addr = userAddresses[i];
            if (users[addr].role == Role.Authority && users[addr].isVerified) {
                result[resultIndex] = addr;
                resultIndex++;
            }
        }

        return result;
    }

    function getPendingAuthorities()
        external
        view
        onlyAdmin
        returns (address[] memory)
    {
        return pendingAuthorities;
    }

    function getUserRole(address _userAddress) external view returns (Role) {
        if (!users[_userAddress].exists) {
            return Role.None;
        }
        return users[_userAddress].role;
    }

    function isUserVerified(address _userAddress) external view returns (bool) {
        if (!users[_userAddress].exists) {
            return false;
        }
        return users[_userAddress].isVerified;
    }

    function getAllUsers() external view returns (address[] memory) {
        return userAddresses;
    }
}

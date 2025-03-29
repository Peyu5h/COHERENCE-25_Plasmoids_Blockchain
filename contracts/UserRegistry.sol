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
        Income
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
        string certificateId;
        string issuanceDate;
        string ipfsHash;
        CertificateType certificateType;
        bool isVerified;
        uint256 timestamp;
        string metadata;
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
    event CertificateUploaded(
        address indexed userAddress,
        string certificateId,
        CertificateType certificateType,
        bool isVerified
    );
    event CertificateMockApproved(
        address indexed userAddress,
        string certificateId,
        string message
    );
    event CertificateMockRejected(
        address indexed userAddress,
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

    function uploadCertificate(
        string memory _certificateId,
        string memory _issuanceDate,
        string memory _ipfsHash,
        string memory _metadata
    ) external userExists {
        Certificate memory newCertificate = Certificate({
            userAddress: msg.sender,
            certificateId: _certificateId,
            issuanceDate: _issuanceDate,
            ipfsHash: _ipfsHash,
            certificateType: CertificateType.Income,
            isVerified: true,
            timestamp: block.timestamp,
            metadata: _metadata
        });

        userCertificates[msg.sender].push(newCertificate);

        emit CertificateUploaded(
            msg.sender,
            _certificateId,
            CertificateType.Income,
            true
        );
    }

    function mockApproveCertificate(
        address _userAddress,
        string memory _certificateId
    ) external onlyAuthority {
        emit CertificateMockApproved(
            _userAddress,
            _certificateId,
            "Certificate mock approved"
        );
    }

    function mockRejectCertificate(
        address _userAddress,
        string memory _certificateId,
        string memory _reason
    ) external onlyAuthority {
        emit CertificateMockRejected(_userAddress, _certificateId, _reason);
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

    function getAllUsersCertificates()
        external
        view
        onlyAuthority
        returns (
            address[] memory userAddrs,
            Certificate[][] memory certificates
        )
    {
        uint256 userCount = userAddresses.length;
        userAddrs = new address[](userCount);
        certificates = new Certificate[][](userCount);

        for (uint i = 0; i < userCount; i++) {
            address userAddr = userAddresses[i];
            userAddrs[i] = userAddr;
            certificates[i] = userCertificates[userAddr];
        }

        return (userAddrs, certificates);
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

    function updateUserProfile(
        string memory _name,
        string memory _dob,
        string memory _gender,
        string memory _physicalAddress,
        string memory _mobileNumber
    ) external userExists {
        UserData storage userData = users[msg.sender];

        userData.name = _name;
        userData.dob = _dob;
        userData.gender = _gender;
        userData.physicalAddress = _physicalAddress;
        userData.mobileNumber = _mobileNumber;
    }

    function updateCertificateMetadata(
        uint256 _certificateIndex,
        string memory _newMetadata
    ) external userExists {
        require(
            _certificateIndex < userCertificates[msg.sender].length,
            "Certificate does not exist"
        );

        userCertificates[msg.sender][_certificateIndex].metadata = _newMetadata;
    }
}

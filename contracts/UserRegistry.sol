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

    address public admin;
    mapping(address => UserData) public users;
    address[] public userAddresses;
    address[] public pendingAuthorities;

    event UserRegistered(address indexed userAddress, string name, Role role);
    event AuthorityVerified(address indexed authorityAddress, string name);
    event UserPromoted(
        address indexed userAddress,
        Role previousRole,
        Role newRole
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier userExists() {
        require(users[msg.sender].exists, "User does not exist");
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
        require(!users[msg.sender].exists, "User already registered");

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
        require(!users[msg.sender].exists, "User already registered");

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
        pendingAuthorities.push(msg.sender);
        emit UserRegistered(msg.sender, _name, Role.Authority);
    }

    function registerVerifier(
        string memory _name,
        string memory _dob,
        string memory _gender,
        string memory _physicalAddress,
        string memory _mobileNumber
    ) external {
        require(!users[msg.sender].exists, "User already registered");

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

    function promoteToVerifier(address _userAddress) external onlyAdmin {
        require(users[_userAddress].exists, "User does not exist");
        require(
            users[_userAddress].role < Role.Verifier,
            "User already has equal or higher role"
        );

        Role previousRole = users[_userAddress].role;
        users[_userAddress].role = Role.Verifier;

        emit UserPromoted(_userAddress, previousRole, Role.Verifier);
    }

    function promoteToAuthority(address _userAddress) external onlyAdmin {
        require(users[_userAddress].exists, "User does not exist");
        require(
            users[_userAddress].role < Role.Authority,
            "User already has equal or higher role"
        );

        Role previousRole = users[_userAddress].role;
        users[_userAddress].role = Role.Authority;

        emit UserPromoted(_userAddress, previousRole, Role.Authority);
    }

    function promoteToAdmin(address _userAddress) external onlyAdmin {
        require(users[_userAddress].exists, "User does not exist");
        require(
            users[_userAddress].role < Role.Admin,
            "User already has equal or higher role"
        );

        Role previousRole = users[_userAddress].role;
        users[_userAddress].role = Role.Admin;

        emit UserPromoted(_userAddress, previousRole, Role.Admin);
    }

    function approveAuthority(address _authorityAddress) external onlyAdmin {
        require(users[_authorityAddress].exists, "Authority does not exist");
        require(
            users[_authorityAddress].role == Role.Authority,
            "Not an authority"
        );
        require(
            !users[_authorityAddress].isVerified,
            "Authority already verified"
        );

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
        require(users[_userAddress].exists, "User does not exist");
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

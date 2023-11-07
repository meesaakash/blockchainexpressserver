// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./DateTime.sol";
import "./Whitelist.sol";

contract DigitalBond is Initializable, ERC20Upgradeable {
    struct PaperContract {
        bytes32 _paperContractHash;
        string _paperContractUrl;
    }

    address private _registrar;
    address private _issuer;
    Whitelist public whitelist;
    uint256 private _totalSupply;
    bool private _paused;
    string private _isin;
    uint256 private _issuanceDate;
    uint256 private _maturityDate;
    uint8 private _decimals;
    PaperContract private paperContract;

    mapping(address => bool) collective;
    mapping(address => bool) collectiveIsSet;

    event BurnEvent(address from, uint256 amount);
    event PauseEvent(bool paused);
    event ContractUpdateEvent(bytes32 contractHash);
    event RegistrarUpdateEvent(address registrar);
    event IssuerUpdateEvent(address registrar);
    event RedeemEvent();

    function initialize(
        address issuer_,
        string memory isin_,
        string memory bondName,
        string memory bondSymbol,
        string memory paperContractUrl_,
        bytes32 paperContractHash_,
        uint256 totalSupply_,
        uint16 issuanceDate_,
        uint8 maturityDate_,
        address whitelistContractAddress_,
        uint8 decimals_
    ) public initializer {
        _issuanceDate = issuanceDate_;

        _maturityDate = maturityDate_;

        require(
            _maturityDate > _issuanceDate,
            "maturity should be aftr issuance"
        );
        __ERC20_init(bondName, bondSymbol);
        _registrar = msg.sender;
        _issuer = issuer_;
        _totalSupply = totalSupply_;
        _isin = isin_;
        paperContract._paperContractHash = paperContractHash_;
        paperContract._paperContractUrl = paperContractUrl_;
        _decimals = decimals_;
        whitelist = Whitelist(whitelistContractAddress_);
        _mint(_issuer, _totalSupply);
    }

    modifier onlyRegistrar() {
        require(
            msg.sender == _registrar,
            "Unauthorised call to registrar restricted function"
        );
        _;
    }
    modifier onlyApprovedAddress(address _address) {
        require(
            whitelist.approvedForTransfer(_address),
            "Address frozen or not whitelisted"
        );
        _;
    }

    modifier isLive() {
        require(!_paused, "Contract is currently paused");
        _;
    }

    modifier isNonZeroAddress(address _address) {
        require(_address != address(0), "Zero address is not allowed");
        _;
    }

    function registrar() external view returns (address) {
        return _registrar;
    }

    function issuer() external view returns (address) {
        return _issuer;
    }

    function toTimestamp(
        uint16 year,
        uint8 month,
        uint8 day
    ) public pure returns (uint256 timestamp) {
        return toTimestamp(year, month, day);
    }

    function totalSupply()
        public
        view
        override(ERC20Upgradeable)
        returns (uint256)
    {
        return _totalSupply;
    }

    function currentSupply() public view returns (uint256) {
        return balanceOf(_issuer);
    }

    function paused() external view returns (bool) {
        return _paused;
    }

    function paperContractHash() external view returns (bytes32) {
        return paperContract._paperContractHash;
    }

    function paperContractUrl() external view returns (string memory) {
        return paperContract._paperContractUrl;
    }

    function isin() external view returns (string memory) {
        return _isin;
    }

    function issuanceMonth() external view returns (uint256) {
        return DateTime.getMonth(_issuanceDate);
    }

    function issuanceDate() external view returns (uint256) {
        return DateTime.getDay(_issuanceDate);
    }

    function issuanceYear() external view returns (uint256) {
        return DateTime.getYear(_issuanceDate);
    }

    function maturityMonth() external view returns (uint256) {
        return DateTime.getMonth(_maturityDate);
    }

    function maturityDate() external view returns (uint256) {
        return DateTime.getDay(_maturityDate);
    }

    function maturityYear() external view returns (uint256) {
        return DateTime.getYear(_maturityDate);
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    /// Write Functions

    // Registrar transfer in order to force a transfer
    function registrarTransfer(
        address from,
        address to,
        uint256 amount
    )
        public
        isLive
        onlyRegistrar
        onlyApprovedAddress(to)
        isNonZeroAddress(from)
        isNonZeroAddress(to)
        onlyApprovedAddress(from)
        returns (bool)
    {
        _approve(from, _registrar, amount);
        transferFrom(from, to, amount);
        return true;
    }

    function setCollectiveField(
        address _address,
        bool isCollective
    ) public onlyRegistrar returns (bool) {
        collective[_address] = isCollective;
        collectiveIsSet[_address] = true;
        return true;
    }

    function checkCollectiveIsSet(address _address) public view returns (bool) {
        return collectiveIsSet[_address];
    }

    function pauseTransfers(bool pause) external onlyRegistrar returns (bool) {
        _paused = pause;
        emit PauseEvent(pause);
        return true;
    }

    function setPaperContract(
        string memory paperContractUrl_,
        bytes32 contractHash
    ) external isLive onlyRegistrar returns (bool) {
        paperContract._paperContractUrl = paperContractUrl_;
        paperContract._paperContractHash = contractHash;
        emit ContractUpdateEvent(contractHash);
        return true;
    }

    // Redeem tokens to issuer
    function redeem() external isLive onlyRegistrar returns (bool) {
        address[] memory addresses = whitelist.allWhitelistedAddresses();
        for (uint8 i = 0; i < addresses.length; i++) {
            address investor = addresses[i];
            uint256 ibalance = balanceOf(investor);
            _approve(investor, _registrar, ibalance);
            transferFrom(investor, _issuer, ibalance);
        }
        emit RedeemEvent();
        return true;
    }

    function setRegistrar(
        address _newRegistrar
    )
        external
        onlyRegistrar
        isNonZeroAddress(_newRegistrar)
        onlyApprovedAddress(_newRegistrar)
        returns (bool)
    {
        _registrar = _newRegistrar;
        emit RegistrarUpdateEvent(_newRegistrar);
        return true;
    }

    function setIssuer(
        address _newIssuer
    )
        external
        onlyRegistrar
        isNonZeroAddress(_newIssuer)
        onlyApprovedAddress(_newIssuer)
        returns (bool)
    {
        _issuer = _newIssuer;
        emit IssuerUpdateEvent(_newIssuer);
        return true;
    }

    // similar to ERC20 burn, but registrar can call it on any address
    function registrarBurnFrom(
        address _address,
        uint256 amount
    ) public isLive onlyRegistrar returns (bool) {
        require(amount > 0, "Units to burn must be greater than 0 ");
        require(balanceOf(_address) >= amount, "Insufficient units to burn ");
        //allowAddress(_address, true);
        _approve(_address, _registrar, amount);
        _burn(_address, amount);

        emit BurnEvent(_address, amount);
        return true;
    }

    function registrarBurnAllFrom(address _address) external returns (bool) {
        return registrarBurnFrom(_address, balanceOf(_address));
    }

    function mint(
        address account,
        uint256 amount
    )
        public
        isLive
        onlyRegistrar
        isNonZeroAddress(account)
        onlyApprovedAddress(account)
        returns (bool)
    {
        _mint(account, amount);
        return true;
    }

    // ERC20 override functions
    function transfer(
        address to,
        uint256 amount
    )
        public
        override(ERC20Upgradeable)
        isLive
        onlyApprovedAddress(msg.sender)
        onlyApprovedAddress(to)
        returns (bool)
    {
        _transfer(msg.sender, to, amount);
        return true;
    }
    
    function transferFrom(
        address from,
        address to,
        uint256 amount
    )
        public
        override(ERC20Upgradeable)
        isLive
        onlyApprovedAddress(from)
        onlyApprovedAddress(to)
        returns (bool)
    {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }
}

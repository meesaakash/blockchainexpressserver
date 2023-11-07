// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DvP {
    IERC20 public bondToken;
    IERC20 public cashToken;

    uint256 public swapIndex;

    mapping(uint256 => DvPSwapDef) public swaps;

    struct DvPSwapDef {
        address payable recipient; // User who recieved tokens (if none - address(0))
        address payable sender; // User who initialized the swap
        address payable token2Sell; // Token offered by the sender
        uint256 amount2Sell; // The number of tokens to give away
        uint256 amount2Buy; // The number of tokens to receive
    }

    event SwapCreated(uint256 swapId);
    event SwapFinalized(uint256 swapId);
    event SwapCanceled(uint256 swapId);

    modifier existing(uint256 _swapId) {
        require(isRegistered(_swapId), "contract does not exist");
        _;
    }
    
    modifier refundable(uint256 _swapId) {
        require(
            swaps[_swapId].sender == msg.sender,
            "Only the sender of this coin can cancel swap"
        );
        require(
            swaps[_swapId].recipient == address(0),
            "Already finalized or canceled"
        );
        _;
    }

    modifier claimable(uint256 _swapId) {
        require(
            swaps[_swapId].recipient == address(0),
            "Already finalized or canceled"
        );
        _;
    }

    constructor(address _tokenA, address _tokenB) {
        bondToken = IERC20(_tokenA);
        cashToken = IERC20(_tokenB);
        swapIndex = 0;
    }

    function isRegistered(
        uint256 _swapId
    ) internal view returns (bool registered) {
        registered = (swaps[_swapId].sender != address(0));
    }

    function newSwap(
        address _token2Sell,
        uint256 _amount2Sell,
        uint256 _amount2Buy
    ) public payable returns (uint256) {
        require(
            _token2Sell == address(bondToken) ||
                _token2Sell == address(cashToken),
            "Invalid token address"
        );
        require(
            _amount2Sell > 0 && _amount2Buy > 0,
            "Ammount must be greter than 0"
        );
        // Securing tokens as a deposit to cover the transaction
        if (
            !ERC20(_token2Sell).transferFrom(
                msg.sender,
                address(this),
                _amount2Sell
            )
        ) revert("transfer failed");
        // Register the swap
        swapIndex += 1;
        swaps[swapIndex] = DvPSwapDef({
            recipient: payable(address(0)),
            sender: payable(msg.sender),
            token2Sell: payable(_token2Sell),
            amount2Sell: _amount2Sell,
            amount2Buy: _amount2Buy
        });
        emit SwapCreated(swapIndex);
        return swapIndex;
    }

    function cancelSwap(
        uint256 _swapId
    ) external existing(_swapId) refundable(_swapId) returns (bool) {
        DvPSwapDef storage s = swaps[_swapId];
        // Tokens withdrawal from the deposit = closing the swap
        !ERC20(s.token2Sell).transfer(s.sender, s.amount2Sell);
        s.recipient = s.sender;
        emit SwapCanceled(_swapId);
        return true;
    }

    function finalizeSwap(
        uint256 _swapId
    ) public payable existing(_swapId) claimable(_swapId) returns (bool) {
        DvPSwapDef storage s = swaps[_swapId];
        IERC20 token2Buy = (s.token2Sell == address(bondToken))
            ? cashToken
            : bondToken;
        require(
            token2Buy.allowance(msg.sender, address(this)) >= s.amount2Buy,
            "Not enough allowance"
        );
        // Transfer the required number of tokens to the swap-creating party
        if (!token2Buy.transferFrom(msg.sender, s.sender, s.amount2Buy))
            revert("transfer failed");
        // Transfer token from a deposit from the sender to the counterparty
        if (!ERC20(s.token2Sell).transfer(msg.sender, s.amount2Sell))
            revert("transfer failed");
        s.recipient = payable(msg.sender);
        emit SwapFinalized(_swapId);
        return true;
    }

    function getSwapCount() public view returns (uint256) {
        return swapIndex;
    }

    function getSwap(uint256 _swapId) public view returns (DvPSwapDef memory) {
        DvPSwapDef memory swapDetails;
        swapDetails = swaps[_swapId];
        return swapDetails;
    }
}

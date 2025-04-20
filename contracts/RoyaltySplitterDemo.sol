// SPDX‑License‑Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title RoyaltySplitterDemo
 * @dev Minimal proof‑of‑concept for splitting ETH music‑royalty revenue
 *      between fixed payees and a “fan pool”.
 *
 *      • No external libraries, no ERC‑20, no oracle dependencies.
 *      • All arithmetic uses Solidity ≥0.8’s built‑in overflow checks.
 */
contract RoyaltySplitterDemo {
    /* --------------------------------------------------------------------- */
    /* Payee data                                                            */
    /* --------------------------------------------------------------------- */
    struct Payee {
        address account;
        uint256 weight;        // arbitrary units – e.g. 70, 20, 10
    }

    Payee[] public payees;
    uint256 public immutable totalWeight;  // sum of weights

    /* --------------------------------------------------------------------- */
    /* Fan‑pool accounting                                                   */
    /* --------------------------------------------------------------------- */
    uint16  public immutable fanShareBPS;   // e.g. 3000 = 30 %
    uint256 public totalFanPool;            // unclaimed ETH reserved for fans

    mapping(address => uint256) public fanBalance;        // “mock ERC‑20” balance
    uint256 public mockFanTotalSupply;                    // total of fanBalance
    mapping(address => uint256) public fanClaimed;        // what each fan has already pulled

    /* --------------------------------------------------------------------- */
    /* Events                                                                */
    /* --------------------------------------------------------------------- */
    event Distributed(uint256 payeePortion, uint256 fanPortion);
    event FanClaimed(address indexed fan, uint256 amount);

    /* --------------------------------------------------------------------- */
    /* Constructor                                                           */
    /* --------------------------------------------------------------------- */
    constructor(
        address[] memory _payees,
        uint256[] memory _weights,
        uint16 _fanShareBPS
    ) {
        require(_payees.length == _weights.length && _payees.length > 0, "Bad arrays");
        require(_fanShareBPS <= 10_000, "BPS > 100%");
        fanShareBPS = _fanShareBPS;

        uint256 _totalWeight = 0;
        for (uint256 i; i < _payees.length; i++) {
            require(_payees[i] != address(0) && _weights[i] > 0, "Bad payee");
            payees.push(Payee({account: _payees[i], weight: _weights[i]}));
            _totalWeight += _weights[i];
        }
        totalWeight = _totalWeight;
    }

    /* --------------------------------------------------------------------- */
    /* Plain ETH receiver                                                    */
    /* --------------------------------------------------------------------- */
    receive() external payable { /* just accept */ }

    /* --------------------------------------------------------------------- */
    /* Revenue distribution                                                  */
    /* --------------------------------------------------------------------- */
    function distribute() external {
        // balance that has NOT been earmarked for fans yet
        uint256 undistributed = address(this).balance - totalFanPool;
        require(undistributed > 0, "Nothing to distribute");

        uint256 fanPortion = (undistributed * fanShareBPS) / 10_000;
        uint256 payeePortion = undistributed - fanPortion;

        // reserve fans’ share inside the contract
        totalFanPool += fanPortion;

        // pay the collaborators
        for (uint256 i; i < payees.length; i++) {
            uint256 amount = (payeePortion * payees[i].weight) / totalWeight;
            (bool ok, ) = payees[i].account.call{value: amount}("");
            require(ok, "Payee transfer failed");
        }

        emit Distributed(payeePortion, fanPortion);
    }

    /* --------------------------------------------------------------------- */
    /* Mock fan‑token mechanics                                              */
    /* --------------------------------------------------------------------- */
    function mintFan(address fan, uint256 amount) external {
        require(fan != address(0) && amount > 0, "Bad mint");
        fanBalance[fan] += amount;
        mockFanTotalSupply += amount;
    }

    /* --------------------------------------------------------------------- */
    /* Fan withdrawal                                                        */
    /* --------------------------------------------------------------------- */
    function claimFan() external {
        uint256 entitled = (totalFanPool * fanBalance[msg.sender]) / mockFanTotalSupply;
        uint256 already = fanClaimed[msg.sender];
        uint256 due = entitled - already;
        require(due > 0, "Nothing to claim");

        fanClaimed[msg.sender] = entitled;          // pull‑forward accounting
        (bool ok, ) = msg.sender.call{value: due}("");
        require(ok, "Fan transfer failed");

        emit FanClaimed(msg.sender, due);
    }
}
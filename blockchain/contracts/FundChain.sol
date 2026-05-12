// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract FundChain is AccessControl {
    bytes32 public constant BACKEND_ROLE = keccak256("BACKEND_ROLE");

    struct Campaign {
        uint256 id;
        uint256 targetAmount;
        uint256 totalRaised;
        uint256 totalDisbursed;
        bool isActive;
        string proofHash;
    }

    struct Donation {
        string bankRef; // TxId từ ngân hàng
        string donor;   // Thông tin người chuyển, có thể ẩn danh
        uint256 amount;
        uint256 timestamp;
    }

    struct Disbursement {
        string beneficiaryId; // CMND/CCCD hoặc identifier của người thụ hưởng
        uint256 amount;
        uint256 timestamp;
        string reasonHash;
    }

    // Biến lưu trữ ID tiếp theo cho chiến dịch
    uint256 public nextCampaignId = 1;

    // Mapping ID -> Thông tin chiến dịch
    mapping(uint256 => Campaign) public campaigns;
    
    // Đảm bảo bankRef là độc nhất (chống trùng lặp Webhook)
    mapping(string => bool) public processedDonations;

    // Lưu trữ lịch sử On-chain
    mapping(uint256 => Donation[]) public campaignDonations;
    mapping(uint256 => Disbursement[]) public campaignDisbursements;

    // --- EVENTS ---
    event CampaignCreated(uint256 indexed campaignId, uint256 targetAmount);
    event DonationRecorded(uint256 indexed campaignId, string indexed bankRef, uint256 amount);
    event FundsDisbursed(uint256 indexed campaignId, uint256 amount, string beneficiaryId, string reasonHash);
    event CampaignClosed(uint256 indexed campaignId, string proofHash);

    // --- CONSTRUCTOR ---
    constructor() {
        // Cấp quyền Admin mặc định cho người tạo contract
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Thêm ví backend vào BACKEND_ROLE.
     * Chỉ admin mới có thể thực hiện.
     */
    function addBackendNode(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(BACKEND_ROLE, account);
    }

    /**
     * @dev Tạo chiến dịch mới.
     * Cần quyền Admin.
     */
    function createCampaign(uint256 _targetAmount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_targetAmount > 0, "Target amount must be > 0");
        
        uint256 campaignId = nextCampaignId++;
        
        campaigns[campaignId] = Campaign({
            id: campaignId,
            targetAmount: _targetAmount,
            totalRaised: 0,
            totalDisbursed: 0,
            isActive: true,
            proofHash: ""
        });

        emit CampaignCreated(campaignId, _targetAmount);
    }

    /**
     * @dev Ghi nhận dòng tiền ủng hộ khi nhận Webhook từ ngân hàng.
     * Cần quyền BACKEND_ROLE.
     */
    function recordDonation(
        uint256 _campaignId, 
        string calldata _bankRef, 
        uint256 _amount,
        string calldata _donor
    ) external onlyRole(BACKEND_ROLE) {
        require(campaigns[_campaignId].isActive, "Campaign is not active");
        require(!processedDonations[_bankRef], "Donation already processed");
        require(_amount > 0, "Amount must be > 0");

        // Đánh dấu mã giao dịch này đã xử lý
        processedDonations[_bankRef] = true;
        
        // Cập nhật tổng số dư
        campaigns[_campaignId].totalRaised += _amount;

        // Lưu giữ lịch sử
        Donation memory newDonation = Donation({
            bankRef: _bankRef,
            donor: _donor,
            amount: _amount,
            timestamp: block.timestamp
        });

        campaignDonations[_campaignId].push(newDonation);

        emit DonationRecorded(_campaignId, _bankRef, _amount);
    }

    /**
     * @dev Giải ngân và ghi nhận lịch sử vào On-chain.
     * Cần quyền Admin.
     */
    function disburseFunds(
        uint256 _campaignId,
        uint256 _amount,
        string calldata _beneficiaryId,
        string calldata _reasonHash
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.id != 0, "Campaign does not exist");
        require(_amount > 0, "Amount must be > 0");
        
        uint256 availableBalance = campaign.totalRaised - campaign.totalDisbursed;
        require(_amount <= availableBalance, "Insufficient funds to disburse");

        // Cập nhật số tiền đã giải ngân
        campaign.totalDisbursed += _amount;

        Disbursement memory newDisbursement = Disbursement({
            beneficiaryId: _beneficiaryId,
            amount: _amount,
            timestamp: block.timestamp,
            reasonHash: _reasonHash
        });

        campaignDisbursements[_campaignId].push(newDisbursement);

        emit FundsDisbursed(_campaignId, _amount, _beneficiaryId, _reasonHash);
    }

    /**
     * @dev Đóng kết thúc chiến dịch.
     * Cần quyền Admin.
     */
    function closeCampaign(uint256 _campaignId, string calldata _proofHash) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(campaigns[_campaignId].isActive, "Campaign is already closed");
        campaigns[_campaignId].isActive = false;
        campaigns[_campaignId].proofHash = _proofHash;
        
        emit CampaignClosed(_campaignId, _proofHash);
    }

    // --- VIEW FUNCTIONS ---
    function getCampaignDonations(uint256 _campaignId) external view returns (Donation[] memory) {
        return campaignDonations[_campaignId];
    }

    function getCampaignDisbursements(uint256 _campaignId) external view returns (Disbursement[] memory) {
        return campaignDisbursements[_campaignId];
    }
}

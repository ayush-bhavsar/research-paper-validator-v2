// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaperValidator {
    // Mapping to store paper hashes and their validation status
    mapping(bytes32 => bool) public validatedPapers;
    mapping(bytes32 => address) public paperOwners;
    mapping(bytes32 => uint256) public validationTimestamps;

    // Events
    event PaperValidated(bytes32 indexed paperHash, address indexed validator, uint256 timestamp);
    event PaperChallenged(bytes32 indexed paperHash, address indexed challenger, uint256 timestamp);

    // Validate a new paper
    function validatePaper(bytes32 paperHash) public {
        require(!validatedPapers[paperHash], "Paper already validated");

        validatedPapers[paperHash] = true;
        paperOwners[paperHash] = msg.sender;
        validationTimestamps[paperHash] = block.timestamp;

        emit PaperValidated(paperHash, msg.sender, block.timestamp);
    }

    // Check if a paper is validated
    function isPaperValidated(bytes32 paperHash) public view returns (bool) {
        return validatedPapers[paperHash];
    }

    // Get paper details
    function getPaperDetails(bytes32 paperHash) public view returns (bool, address, uint256) {
        return (
            validatedPapers[paperHash],
            paperOwners[paperHash],
            validationTimestamps[paperHash]
        );
    }

    // Challenge a paper (for plagiarism detection)
    function challengePaper(bytes32 paperHash) public {
        require(validatedPapers[paperHash], "Paper not validated yet");

        emit PaperChallenged(paperHash, msg.sender, block.timestamp);
    }
}
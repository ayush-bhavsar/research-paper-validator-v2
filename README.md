# Research Paper Validator

A minimal web application for validating research papers using blockchain technology.

## Features

- Upload PDF research papers
- Extract text content using PDF.js
- Generate cryptographic hash of paper content
- Validate originality against blockchain records using smart contract
- Clean, modern UI

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript
- **Blockchain**: Web3.js for Ethereum interaction, Solidity smart contract
- **PDF Processing**: PDF.js for text extraction
- **Styling**: Custom CSS with modern design

## Smart Contract

The project includes a Solidity smart contract (`contracts/PaperValidator.sol`) that:
- Stores validated paper hashes on the blockchain
- Prevents duplicate validations
- Tracks validation timestamps and validators
- Allows checking paper originality

## Setup and Deployment

### 1. Deploy Smart Contract

**Prerequisites:**
- Node.js and npm
- MetaMask wallet
- Some Sepolia ETH for gas fees

**Deploy Contract:**
```bash
# Install Hardhat (if not already installed)
npm install -g hardhat

# Create a new Hardhat project (optional, or use existing)
npx hardhat init

# Copy PaperValidator.sol to contracts/ folder

# Update hardhat.config.js for Sepolia network
# Add your Infura project ID and private key

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

**Get Sepolia ETH:**
- Use [Sepolia Faucet](https://sepoliafaucet.com/)

### 2. Update Contract Address

After deployment, update `CONTRACT_ADDRESS` in `script.js` with your deployed contract address.

### 3. Update Infura Project ID

Replace `YOUR_INFURA_PROJECT_ID` in `script.js` with your Infura project ID.

## How It Works

1. Upload a PDF research paper
2. PDF.js extracts text content from the PDF
3. Web3.js generates a Keccak-256 hash of the content
4. Smart contract checks if hash already exists (plagiarism detection)
5. If new, validates and stores hash on blockchain
6. Results displayed with validation status

## Usage

1. Open `index.html` in a modern web browser
2. Install MetaMask and connect to Sepolia testnet
3. Click "Select PDF file" and choose a research paper
4. Click "Validate Paper" to process the file
5. View the validation results and blockchain transaction

## Security Notes

- Contract requires gas fees for validation transactions
- Only validated papers are stored on blockchain
- Hash collisions are extremely unlikely with Keccak-256

## License

MIT License
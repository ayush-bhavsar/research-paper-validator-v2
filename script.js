// Research Paper Validator using Blockchain
// Real blockchain integration with smart contract

let web3;
let contract;

// Contract details (update with your deployed contract address)
const CONTRACT_ADDRESS = '0xYourDeployedContractAddress'; // Replace with actual address
const CONTRACT_ABI = [
    {
        "inputs": [{"internalType": "bytes32","name": "paperHash","type": "bytes32"}],
        "name": "validatePaper",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "bytes32","name": "paperHash","type": "bytes32"}],
        "name": "isPaperValidated",
        "outputs": [{"internalType": "bool","name": "","type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "bytes32","name": "paperHash","type": "bytes32"}],
        "name": "getPaperDetails",
        "outputs": [
            {"internalType": "bool","name": "","type": "bool"},
            {"internalType": "address","name": "","type": "address"},
            {"internalType": "uint256","name": "","type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// Initialize Web3 and connect to blockchain
async function initWeb3() {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log('Connected to MetaMask');
            initContract();
        } catch (error) {
            console.error('User denied account access');
        }
    } else if (window.web3) {
        web3 = new Web3(window.web3.currentProvider);
        initContract();
    } else {
        // Connect using Alchemy
        web3 = new Web3(`https://eth-sepolia.g.alchemy.com/v2/whcuMhK5w-fHEupPPaegt`);
        console.log('Connected to Sepolia testnet via Alchemy');
        initContract();
    }
}

// Initialize smart contract
function initContract() {
    contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
}

// Extract text from PDF using PDF.js
async function extractTextFromPDF(arrayBuffer) {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + ' ';
    }

    return fullText.trim();
}

// Generate hash from text content
function hashContent(text) {
    return web3.utils.keccak256(text);
}

// Check if paper is already validated on blockchain
async function checkPaperValidation(hash) {
    try {
        const isValidated = await contract.methods.isPaperValidated(hash).call();
        return isValidated;
    } catch (error) {
        console.error('Error checking paper validation:', error);
        throw error;
    }
}

// Validate paper on blockchain
async function validatePaperOnBlockchain(hash) {
    try {
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];

        await contract.methods.validatePaper(hash).send({ from: account });
        return true;
    } catch (error) {
        console.error('Error validating paper:', error);
        throw error;
    }
}

// Read PDF file as ArrayBuffer
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// Handle form submission
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('paperFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a PDF file');
        return;
    }
    
    const submitBtn = e.target.querySelector('.btn');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading"></span> Processing...';
    submitBtn.disabled = true;
    
    try {
        // Initialize Web3 if not already done
        if (!web3) {
            await initWeb3();
        }
        
        // Read and process the file
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const text = await extractTextFromPDF(arrayBuffer);
        const hash = hashContent(text);
        
        // Check if already validated
        const isAlreadyValidated = await checkPaperValidation(hash);
        
        let validationResult;
        if (isAlreadyValidated) {
            validationResult = {
                isValid: false,
                message: 'Paper has been previously validated. Potential duplicate or plagiarism detected.',
                action: 'checked'
            };
        } else {
            // Validate the paper
            await validatePaperOnBlockchain(hash);
            validationResult = {
                isValid: true,
                message: 'Paper successfully validated and recorded on blockchain.',
                action: 'validated'
            };
        }
        
        // Display results
        const resultsSection = document.getElementById('results');
        const resultContent = document.getElementById('resultContent');
        
        resultContent.innerHTML = `
            <h3>File: ${file.name}</h3>
            <p><strong>Hash:</strong> ${hash}</p>
            <p class="${validationResult.isValid ? 'success' : 'error'}">${validationResult.message}</p>
            <p><strong>Action:</strong> ${validationResult.action}</p>
            <p><strong>Validation Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Blockchain:</strong> Ethereum Sepolia Testnet</p>
        `;
        
        resultsSection.style.display = 'block';
        
    } catch (error) {
        console.error('Error during validation:', error);
        alert('An error occurred during validation. Please ensure MetaMask is connected and you have sufficient ETH for gas fees.');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// PDF preview variables
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;

function renderPage(num) {
    pageRendering = true;
    pdfDoc.getPage(num).then(function(page) {
        const canvas = document.getElementById('pdfCanvas');
        const ctx = canvas.getContext('2d');
        const viewport = page.getViewport({scale: scale});

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };

        const renderTask = page.render(renderContext);
        renderTask.promise.then(function() {
            pageRendering = false;
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });

    document.getElementById('currentPage').textContent = num;
}

function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

function showPdfPreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const typedarray = new Uint8Array(e.target.result);

        pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
            pdfDoc = pdf;
            document.getElementById('pageCount').textContent = pdf.numPages;
            document.getElementById('pdfPreview').style.display = 'block';
            renderPage(pageNum);
        });
    };
    reader.readAsArrayBuffer(file);
}

// Handle drag and drop
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    document.querySelector('.upload-area').classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    document.querySelector('.upload-area').classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    document.querySelector('.upload-area').classList.remove('dragover');
    
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0 && files[0].type === 'application/pdf') {
        handleFileSelect(files[0]);
    }
}

function handleFileSelect(file) {
    const fileInfo = document.getElementById('fileInfo');
    const fileName = fileInfo.querySelector('.file-name');
    const fileSize = fileInfo.querySelector('.file-size');

    fileName.textContent = file.name;
    fileSize.textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    fileInfo.style.display = 'block';

    showPdfPreview(file);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Load PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    // Initialize Web3
    initWeb3();

    // Set up PDF preview controls
    document.getElementById('prevPage').addEventListener('click', () => {
        if (pageNum <= 1) return;
        pageNum--;
        queueRenderPage(pageNum);
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        if (pageNum >= pdfDoc.numPages) return;
        pageNum++;
        queueRenderPage(pageNum);
    });

    // Set up drag and drop
    const dropZone = document.getElementById('dropZone');
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    // Handle file input change
    document.getElementById('paperFile').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // Handle remove file
    document.getElementById('removeFile').addEventListener('click', () => {
        // Clear file input
        const fileInput = document.getElementById('paperFile');
        fileInput.value = '';
        
        // Hide file info and preview
        document.getElementById('fileInfo').style.display = 'none';
        document.getElementById('pdfPreview').style.display = 'none';
        
        // Reset PDF viewer
        pdfDoc = null;
        pageNum = 1;
        pageRendering = false;
        pageNumPending = null;
        
        // Reset upload area
        const dropZone = document.getElementById('dropZone');
        dropZone.classList.remove('dragover');
        
        // Clear the canvas
        const canvas = document.getElementById('pdfCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
});
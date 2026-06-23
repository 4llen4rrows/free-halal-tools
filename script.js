// Show/Hide Tools
function showTool(toolName) {
    // Hide all tools
    document.querySelectorAll('.tool').forEach(tool => {
        tool.classList.remove('active');
    });
    
    // Show selected tool
    document.getElementById(toolName + 'Tool').classList.add('active');
    
    // Update active button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(toolName + 'Btn').classList.add('active');
}

// ============ PDF MERGER ============
async function mergePDFs() {
    const files = document.getElementById('pdfFiles').files;
    const status = document.getElementById('pdfStatus');
    
    if (files.length < 2) {
        status.innerHTML = '❌ Please select at least 2 PDF files';
        status.style.background = '#ffe0e0';
        return;
    }
    
    status.innerHTML = '⏳ Merging PDFs... Please wait';
    status.style.background = '#fff3cd';
    
    try {
        const mergedPdf = await PDFLib.PDFDocument.create();
        
        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach(page => mergedPdf.addPage(page));
        }
        
        const mergedPdfBytes = await mergedPdf.save();
        
        // Download
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'merged.pdf';
        link.click();
        
        status.innerHTML = '✅ PDFs merged successfully! Download started.';
        status.style.background = '#d4edda';
    } catch (error) {
        status.innerHTML = '❌ Error merging PDFs: ' + error.message;
        status.style.background = '#ffe0e0';
    }
}

// ============ YOUTUBE THUMBNAIL GRABBER ============
function getThumbnail() {
    const url = document.getElementById('ytUrl').value;
    const result = document.getElementById('thumbnailResult');
    
    if (!url) {
        result.innerHTML = '❌ Please paste a YouTube URL';
        return;
    }
    
    // Extract video ID
    let videoId = '';
    if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('watch?v=')) {
        videoId = url.split('watch?v=')[1].split('&')[0];
    } else if (url.includes('/embed/')) {
        videoId = url.split('/embed/')[1].split('?')[0];
    }
    
    if (!videoId) {
        result.innerHTML = '❌ Invalid YouTube URL. Please check and try again.';
        return;
    }
    
    // Get max resolution thumbnail
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    
    result.innerHTML = `
        <p>✅ Thumbnail found!</p>
        <img src="${thumbnailUrl}" alt="YouTube Thumbnail" style="max-width:100%">
        <br>
        <button onclick="downloadThumbnail('${thumbnailUrl}')" class="action-btn" style="margin-top:10px">
            📥 Download Thumbnail
        </button>
        <p class="note">Right-click on image to save, or use download button</p>
    `;
}

function downloadThumbnail(url) {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'youtube-thumbnail.jpg';
    link.click();
}

// ============ BACKGROUND REMOVER ============
function removeBackground() {
    const file = document.getElementById('imageFile').files[0];
    const result = document.getElementById('bgResult');
    
    if (!file) {
        result.innerHTML = '❌ Please select an image file';
        return;
    }
    
    result.innerHTML = '⏳ Removing background... This may take a moment';
    
    const formData = new FormData();
    formData.append('image_file', file);
    formData.append('size', 'auto');
    
    // Using remove.bg free API (limited to 50 images per month)
    fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
            'X-Api-Key': 'YOUR_REMOVEBG_API_KEY' // Sign up at remove.bg for free key
        },
        body: formData
    })
    .then(response => response.blob())
    .then(blob => {
        const url = URL.createObjectURL(blob);
        result.innerHTML = `
            <p>✅ Background removed!</p>
            <img src="${url}" alt="Background Removed" style="max-width:100%">
            <br>
            <button onclick="downloadImage('${url}')" class="action-btn" style="margin-top:10px">
                📥 Download Image
            </button>
        `;
    })
    .catch(error => {
        result.innerHTML = '❌ Error: ' + error.message + '<br><small>Get free API key from remove.bg</small>';
    });
}

function downloadImage(url) {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'no-background.png';
    link.click();
}

// ============ PASSWORD GENERATOR ============
function generatePassword() {
    const length = document.getElementById('passLength').value;
    const includeUpper = document.getElementById('includeUpper').checked;
    const includeLower = document.getElementById('includeLower').checked;
    const includeNumbers = document.getElementById('includeNumbers').checked;
    const includeSymbols = document.getElementById('includeSymbols').checked;
    
    const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let allChars = '';
    if (includeUpper) allChars += upperChars;
    if (includeLower) allChars += lowerChars;
    if (includeNumbers) allChars += numberChars;
    if (includeSymbols) allChars += symbolChars;
    
    if (allChars === '') {
        document.getElementById('passwordResult').innerHTML = '❌ Select at least one character type';
        return;
    }
    
    let password = '';
    for (let i = 0; i < length; i++) {
        password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    document.getElementById('passwordResult').innerHTML = `
        <h3>Your Generated Password:</h3>
        <div style="background:#e8f5e9; padding:15px; border-radius:8px; margin:10px 0;">
            <code style="font-size:20px; word-break:break-all;">${password}</code>
        </div>
        <button onclick="copyPassword('${password}')" class="action-btn">📋 Copy to Clipboard</button>
    `;
}

function copyPassword(password) {
    navigator.clipboard.writeText(password).then(() => {
        alert('✅ Password copied to clipboard!');
    });
}
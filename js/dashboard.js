// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDCh_UZeQZSeMjNXFSs0WGfmsweesIXYrc",
    authDomain: "photosys-5454c.firebaseapp.com",
    projectId: "photosys-5454c",
    storageBucket: "photosys-5454c.firebasestorage.app",
    messagingSenderId: "194619075721",
    appId: "1:194619075721:web:35c8965bc9c1186b192a58",
    measurementId: "G-Q8HKB41QCH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

// State Management
let currentUser = null;
let files = [];
let currentFilter = 'all';
let currentView = 'grid';
let currentPreviewFile = null;

// DOM Elements
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');

// File Management
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const fileGrid = document.getElementById('fileGrid');
const fileList = document.getElementById('fileList');
const emptyState = document.getElementById('emptyState');

// Filter Buttons
const filterButtons = document.querySelectorAll('.filter-btn');
const gridViewBtn = document.getElementById('gridViewBtn');
const listViewBtn = document.getElementById('listViewBtn');

// Preview Modal
const previewModal = document.getElementById('previewModal');
const previewContent = document.getElementById('previewContent');
const closeModal = document.querySelector('.close-modal');
const downloadPreviewBtn = document.getElementById('downloadPreviewBtn');
const deletePreviewBtn = document.getElementById('deletePreviewBtn');

// Progress
const uploadProgress = document.getElementById('uploadProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const loadingSpinner = document.getElementById('loadingSpinner');

// Event Listeners - File Management
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileUpload);

// Event Listeners - Filter
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderFiles();
    });
});

// Event Listeners - View Toggle
gridViewBtn.addEventListener('click', () => switchView('grid'));
listViewBtn.addEventListener('click', () => switchView('list'));

// Event Listeners - Preview Modal
closeModal.addEventListener('click', () => {
    previewModal.classList.add('hidden');
    currentPreviewFile = null;
});

downloadPreviewBtn.addEventListener('click', handleDownload);
deletePreviewBtn.addEventListener('click', handleDelete);

// Prevent modal close on click inside
previewModal.querySelector('.modal-content').addEventListener('click', (e) => e.stopPropagation());
previewModal.addEventListener('click', (e) => {
    if (e.target === previewModal) {
        previewModal.classList.add('hidden');
        currentPreviewFile = null;
    }
});

// Authentication
function handleLogout() {
    signOut(auth)
        .then(() => {
            window.location.href = 'login.html';
        })
        .catch((error) => {
            alert('Logout failed: ' + error.message);
        });
}

logoutBtn.addEventListener('click', handleLogout);

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        userName.textContent = user.displayName || user.email;
        loadUserFiles();
    } else {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
    }
});

// File Management Functions
async function handleFileUpload(event) {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const uploadPromises = Array.from(selectedFiles).map(file => uploadFile(file));
    
    try {
        await Promise.all(uploadPromises);
        await loadUserFiles();
        fileInput.value = '';
    } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed: ' + error.message);
    }
}

async function uploadFile(file) {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `users/${currentUser.uid}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                updateUploadProgress(progress, file.name);
            },
            (error) => {
                hideUploadProgress();
                reject(error);
            },
            async () => {
                try {
                    hideUploadProgress();
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    
                    // Try to save file metadata to Firestore (optional)
                    try {
                        await addDoc(collection(db, 'files'), {
                            userId: currentUser.uid,
                            fileName: file.name,
                            fileSize: file.size,
                            fileType: file.type,
                            downloadURL: downloadURL,
                            uploadedAt: serverTimestamp()
                        });
                    } catch (firestoreError) {
                        console.log('Firestore save skipped (upload still successful)');
                        // Continue even if Firestore fails
                    }
                    
                    resolve();
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
}

function updateUploadProgress(progress, fileName) {
    uploadProgress.classList.remove('hidden');
    progressFill.style.width = progress + '%';
    progressText.textContent = `Uploading ${fileName}... ${Math.round(progress)}%`;
}

function hideUploadProgress() {
    setTimeout(() => {
        uploadProgress.classList.add('hidden');
        progressFill.style.width = '0%';
        progressText.textContent = 'Uploading...';
    }, 1000);
}

async function loadUserFiles() {
    if (!currentUser) return;

    showLoading();
    
    // Set timeout to prevent infinite loading
    const timeout = setTimeout(() => {
        hideLoading();
        files = [];
        renderFiles();
    }, 1500); // 1.5 second timeout
    
    try {
        // Try to query files from Firestore with quick timeout
        const queryWithTimeout = Promise.race([
            getDocs(query(
                collection(db, 'files'),
                where('userId', '==', currentUser.uid)
            )),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Query timeout')), 1000) // 1 second timeout
            )
        ]);
        
        const filesSnapshot = await queryWithTimeout;

        files = filesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            uploadedAt: doc.data().uploadedAt?.toDate() || new Date()
        }));

        // Sort by uploadedAt after getting results
        files.sort((a, b) => {
            const dateA = a.uploadedAt.getTime ? a.uploadedAt.getTime() : 0;
            const dateB = b.uploadedAt.getTime ? b.uploadedAt.getTime() : 0;
            return dateB - dateA;
        });

        renderFiles();
        clearTimeout(timeout); // Clear timeout if successful
    } catch (error) {
        // Silently handle Firestore errors
        console.log('Loading files without Firestore (using local storage only)');
        files = [];
        renderFiles();
        clearTimeout(timeout);
    } finally {
        hideLoading();
    }
}

function renderFiles() {
    const filteredFiles = filterFiles(files);
    
    if (filteredFiles.length === 0) {
        emptyState.classList.remove('hidden');
        fileGrid.innerHTML = '';
        fileList.innerHTML = '';
        return;
    }

    emptyState.classList.add('hidden');

    if (currentView === 'grid') {
        renderGridView(filteredFiles);
    } else {
        renderListView(filteredFiles);
    }
}

function filterFiles(files) {
    if (currentFilter === 'all') return files;

    return files.filter(file => {
        const type = getFileType(file.fileType, file.fileName);
        return type === currentFilter;
    });
}

function getFileType(mimeType, fileName) {
    if (mimeType && mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType && mimeType.startsWith('video/')) return 'video';
    if (fileName && fileName.toLowerCase().endsWith('.pdf')) return 'pdf';
    return 'other';
}

function renderGridView(filesToRender) {
    fileGrid.classList.remove('hidden');
    fileList.classList.add('hidden');
    fileGrid.innerHTML = '';

    filesToRender.forEach(file => {
        const fileCard = createFileCard(file);
        fileGrid.appendChild(fileCard);
    });
}

function renderListView(filesToRender) {
    fileList.classList.remove('hidden');
    fileGrid.classList.add('hidden');
    fileList.innerHTML = '';

    filesToRender.forEach(file => {
        const fileRow = createFileRow(file);
        fileList.appendChild(fileRow);
    });
}

function createFileCard(file) {
    const div = document.createElement('div');
    div.className = 'file-item';
    
    const isImage = file.fileType?.startsWith('image/');
    const fileType = getFileType(file.fileType, file.fileName);
    
    div.innerHTML = `
        ${isImage 
            ? `<img src="${file.downloadURL}" alt="${file.fileName}" onerror="this.style.display='none';">`
            : `<div class="file-icon">${getFileIcon(fileType)}</div>`
        }
        <div class="file-info">
            <div class="file-name" title="${file.fileName}">${file.fileName}</div>
            <div class="file-size">${formatFileSize(file.fileSize)}</div>
            <div class="file-date">${formatDate(file.uploadedAt)}</div>
        </div>
    `;
    
    div.addEventListener('click', () => openPreview(file));
    
    return div;
}

function createFileRow(file) {
    const div = document.createElement('div');
    div.className = 'file-item';
    
    const isImage = file.fileType?.startsWith('image/');
    const fileType = getFileType(file.fileType, file.fileName);
    
    div.innerHTML = `
        ${isImage 
            ? `<img src="${file.downloadURL}" alt="${file.fileName}" onerror="this.style.display='none';">`
            : `<div class="file-icon">${getFileIcon(fileType)}</div>`
        }
        <div class="file-info">
            <div class="file-name">${file.fileName}</div>
            <div class="file-size">${formatFileSize(file.fileSize)} • ${formatDate(file.uploadedAt)}</div>
            <span class="file-type-badge badge-${fileType}">${fileType.toUpperCase()}</span>
        </div>
        <div class="file-actions">
            <button class="icon-btn" onclick="event.stopPropagation(); handleDownloadFromList('${file.id}')" title="Download">⬇️</button>
            <button class="icon-btn" onclick="event.stopPropagation(); handleDeleteFromList('${file.id}')" title="Delete">🗑️</button>
        </div>
    `;
    
    div.addEventListener('click', () => openPreview(file));
    
    return div;
}

function getFileIcon(type) {
    const icons = {
        image: '🖼️',
        pdf: '📄',
        video: '🎬',
        other: '📁'
    };
    return icons[type] || icons.other;
}

function formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i)) + ' ' + sizes[i];
}

function formatDate(date) {
    if (!date) return 'Unknown';
    try {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return 'Invalid Date';
    }
}

function switchView(view) {
    currentView = view;
    if (view === 'grid') {
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
    } else {
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
    }
    renderFiles();
}

// Preview Functions
function openPreview(file) {
    currentPreviewFile = file;
    previewContent.innerHTML = '';
    
    const isImage = file.fileType?.startsWith('image/');
    const isVideo = file.fileType?.startsWith('video/');
    const isPDF = file.fileType === 'application/pdf' || file.fileName.toLowerCase().endsWith('.pdf');
    
    let content = '';
    
    if (isImage) {
        content = `<img src="${file.downloadURL}" alt="${file.fileName}">`;
    } else if (isVideo) {
        content = `<video controls><source src="${file.downloadURL}" type="${file.fileType}"></video>`;
    } else if (isPDF) {
        content = `<iframe src="${file.downloadURL}"></iframe>`;
    } else {
        const fileType = getFileType(file.fileType, file.fileName);
        content = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">${getFileIcon(fileType)}</div>
                <h3>${file.fileName}</h3>
                <p style="color: var(--text-secondary);">Preview not available for this file type</p>
            </div>
        `;
    }
    
    previewContent.innerHTML = content;
    previewModal.classList.remove('hidden');
}

// Download and Delete Functions
function handleDownload() {
    if (!currentPreviewFile) return;
    downloadFile(currentPreviewFile);
}

function handleDelete() {
    if (!currentPreviewFile) return;
    if (confirm('Are you sure you want to delete this file?')) {
        deleteFile(currentPreviewFile.id);
    }
}

function downloadFile(file) {
    const link = document.createElement('a');
    link.href = file.downloadURL;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function deleteFile(fileId) {
    showLoading();
    try {
        const fileDocRef = doc(db, 'files', fileId);
        
        // Get the file data first to get the downloadURL
        const q = query(collection(db, 'files'), where('__name__', '==', fileId));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            const fileData = snapshot.docs[0].data();
            
            // Delete from Storage
            const storageRef = ref(storage, fileData.downloadURL);
            try {
                await deleteObject(storageRef);
            } catch (storageError) {
                console.warn('Storage delete error (file may already be deleted):', storageError);
            }
            
            // Delete from Firestore
            await deleteDoc(fileDocRef);
        }
        
        hideLoading();
        await loadUserFiles();
        previewModal.classList.add('hidden');
        currentPreviewFile = null;
    } catch (error) {
        hideLoading();
        alert('Delete failed: ' + error.message);
    }
}

function handleDownloadFromList(fileId) {
    const file = files.find(f => f.id === fileId);
    if (file) {
        downloadFile(file);
    }
}

function handleDeleteFromList(fileId) {
    if (confirm('Are you sure you want to delete this file?')) {
        deleteFile(fileId);
    }
}

// Export functions for inline onclick handlers
window.handleDownloadFromList = handleDownloadFromList;
window.handleDeleteFromList = handleDeleteFromList;

// Utility Functions
function showLoading() {
    loadingSpinner.classList.remove('hidden');
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
}


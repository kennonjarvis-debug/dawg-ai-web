<script lang="ts">
/**
 * File Uploader Component
 * Module 10: Cloud Storage & Backend
 *
 * Drag-and-drop file uploader for audio files
 */

import { createEventDispatcher } from 'svelte';
import { fileAPI, type FileRecord } from '$lib/api/FileAPI';
import type { UUID } from '$lib/types/core';

const dispatch = createEventDispatcher();

export let projectId: UUID | undefined = undefined;
export let accept = '.wav,.mp3,.ogg,.flac,.aac,.m4a';
export let maxSize = 100 * 1024 * 1024; // 100MB

let isUploading = false;
let isDragging = false;
let uploadProgress = 0;
let error: string | null = null;
let fileInput: HTMLInputElement;

async function handleFiles(files: FileList | null) {
  if (!files || files.length === 0) return;

  isUploading = true;
  error = null;
  uploadProgress = 0;

  try {
    const fileArray = Array.from(files);
    const uploadedFiles: FileRecord[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

      // Validate file
      if (file.size > maxSize) {
        error = `File "${file.name}" exceeds ${fileAPI.formatFileSize(maxSize)} limit`;
        continue;
      }

      // Upload file
      const uploadedFile = await fileAPI.uploadFile(
        file,
        projectId,
        (progress) => {
          uploadProgress = ((i + progress) / fileArray.length) * 100;
        }
      );

      uploadedFiles.push(uploadedFile);
      uploadProgress = ((i + 1) / fileArray.length) * 100;
    }

    dispatch('upload', { files: uploadedFiles });
  } catch (err) {
    error = err instanceof Error ? err.message : 'Upload failed';
    console.error('Upload error:', err);
  } finally {
    isUploading = false;
    uploadProgress = 0;
  }
}

function handleDrop(event: DragEvent) {
  isDragging = false;
  handleFiles(event.dataTransfer?.files || null);
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();
  isDragging = true;
}

function handleDragLeave() {
  isDragging = false;
}

function handleClick() {
  fileInput?.click();
}
</script>

<div
  class="file-uploader"
  class:dragging={isDragging}
  class:uploading={isUploading}
  on:drop|preventDefault={handleDrop}
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:click={handleClick}
  role="button"
  tabindex="0"
>
  <input
    bind:this={fileInput}
    type="file"
    {accept}
    multiple
    on:change={(e) => handleFiles(e.currentTarget.files)}
    style="display: none;"
  />

  {#if isUploading}
    <div class="upload-progress">
      <div class="spinner"></div>
      <p>Uploading...</p>
      <div class="progress-bar">
        <div class="progress-fill" style="width: {uploadProgress}%"></div>
      </div>
      <p class="progress-text">{Math.round(uploadProgress)}%</p>
    </div>
  {:else}
    <div class="upload-prompt">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
      <p class="main-text">
        {#if isDragging}
          Drop files here
        {:else}
          Drag & drop audio files here
        {/if}
      </p>
      <p class="sub-text">or click to browse</p>
      <p class="info-text">
        Supported formats: WAV, MP3, OGG, FLAC, AAC, M4A<br/>
        Max size: {fileAPI.formatFileSize(maxSize)}
      </p>
    </div>
  {/if}

  {#if error}
    <div class="error-message">
      {error}
      <button on:click|stopPropagation={() => error = null}>✕</button>
    </div>
  {/if}
</div>

<style>
.file-uploader {
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9fafb;
}

.file-uploader:hover:not(.uploading) {
  border-color: #2563eb;
  background: #eff6ff;
}

.file-uploader.dragging {
  border-color: #2563eb;
  background: #dbeafe;
}

.file-uploader.uploading {
  cursor: not-allowed;
  background: #f9fafb;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.upload-prompt svg {
  color: #9ca3af;
}

.main-text {
  font-size: 1.125rem;
  font-weight: 500;
  color: #1f2937;
  margin: 0;
}

.sub-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.info-text {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.5rem;
  line-height: 1.5;
}

.upload-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.upload-progress p {
  margin: 0;
  font-weight: 500;
  color: #1f2937;
}

.progress-bar {
  width: 100%;
  max-width: 300px;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #2563eb;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.error-message button {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0;
}
</style>

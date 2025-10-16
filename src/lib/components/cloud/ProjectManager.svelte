<script lang="ts">
/**
 * Project Manager Component
 * Module 10: Cloud Storage & Backend
 *
 * Main UI for browsing, creating, and managing projects
 */

import { onMount } from 'svelte';
import { projectAPI, type Project } from '$lib/api/ProjectAPI';
import { authAPI } from '$lib/api/AuthAPI';

let projects: Project[] = [];
let isLoading = false;
let error: string | null = null;
let showNewProjectDialog = false;
let newProjectName = '';
let selectedTemplate: string | null = null;
let searchQuery = '';
let sortBy: 'updated' | 'created' | 'name' = 'updated';

// Filter and sort projects
$: filteredProjects = projects
  .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  .sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'created') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
  });

onMount(async () => {
  await loadProjects();
});

async function loadProjects() {
  isLoading = true;
  error = null;

  try {
    projects = await projectAPI.listProjects();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load projects';
    console.error('Error loading projects:', err);
  } finally {
    isLoading = false;
  }
}

async function createProject() {
  if (!newProjectName.trim()) {
    error = 'Project name is required';
    return;
  }

  isLoading = true;
  error = null;

  try {
    const project = await projectAPI.saveProject(newProjectName.trim(), {
      tracks: [],
      tempo: 120,
      timeSignature: [4, 4]
    });

    projects = [project, ...projects];
    showNewProjectDialog = false;
    newProjectName = '';

    // Navigate to project
    window.location.href = `/project/${project.id}`;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to create project';
    console.error('Error creating project:', err);
  } finally {
    isLoading = false;
  }
}

async function deleteProject(id: string, name: string) {
  if (!confirm(`Delete project "${name}"? This action cannot be undone.`)) {
    return;
  }

  isLoading = true;
  error = null;

  try {
    await projectAPI.deleteProject(id);
    projects = projects.filter(p => p.id !== id);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to delete project';
    console.error('Error deleting project:', err);
  } finally {
    isLoading = false;
  }
}

async function duplicateProject(id: string) {
  isLoading = true;
  error = null;

  try {
    const duplicate = await projectAPI.duplicateProject(id);
    projects = [duplicate, ...projects];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to duplicate project';
    console.error('Error duplicating project:', err);
  } finally {
    isLoading = false;
  }
}

async function shareProject(id: string) {
  try {
    const shareToken = await projectAPI.shareProject(id);
    const shareUrl = `${window.location.origin}/shared/${shareToken}`;

    // Copy to clipboard
    await navigator.clipboard.writeText(shareUrl);
    alert(`Share link copied to clipboard!\n${shareUrl}`);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to share project';
    console.error('Error sharing project:', err);
  }
}

function openProject(id: string) {
  window.location.href = `/project/${id}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}
</script>

<div class="project-manager">
  <div class="header">
    <h1>My Projects</h1>
    <button class="btn-primary" on:click={() => showNewProjectDialog = true}>
      + New Project
    </button>
  </div>

  <div class="controls">
    <input
      type="search"
      placeholder="Search projects..."
      bind:value={searchQuery}
      class="search-input"
    />

    <select bind:value={sortBy} class="sort-select">
      <option value="updated">Last Modified</option>
      <option value="created">Date Created</option>
      <option value="name">Name</option>
    </select>
  </div>

  {#if error}
    <div class="error-message">
      {error}
      <button on:click={() => error = null}>✕</button>
    </div>
  {/if}

  {#if isLoading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading projects...</p>
    </div>
  {:else if filteredProjects.length === 0}
    <div class="empty-state">
      <p>No projects found</p>
      {#if searchQuery}
        <button on:click={() => searchQuery = ''}>Clear search</button>
      {:else}
        <button on:click={() => showNewProjectDialog = true}>Create your first project</button>
      {/if}
    </div>
  {:else}
    <div class="project-grid">
      {#each filteredProjects as project (project.id)}
        <div class="project-card">
          <div class="project-header">
            <h3 on:click={() => openProject(project.id)}>{project.name}</h3>
            <div class="project-menu">
              <button class="menu-btn">⋮</button>
              <div class="dropdown">
                <button on:click={() => openProject(project.id)}>Open</button>
                <button on:click={() => duplicateProject(project.id)}>Duplicate</button>
                <button on:click={() => shareProject(project.id)}>Share</button>
                <button on:click={() => deleteProject(project.id, project.name)} class="danger">
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div class="project-info">
            <p class="date">
              Updated: {formatDate(project.updated_at)}
            </p>
            <p class="stats">
              {project.data.tracks?.length || 0} tracks •
              {project.data.tempo || 120} BPM
            </p>
          </div>

          <div class="project-actions">
            <button class="btn-secondary" on:click={() => openProject(project.id)}>
              Open
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if showNewProjectDialog}
  <div class="modal-overlay" on:click={() => showNewProjectDialog = false}>
    <div class="modal" on:click|stopPropagation>
      <div class="modal-header">
        <h2>New Project</h2>
        <button class="close-btn" on:click={() => showNewProjectDialog = false}>✕</button>
      </div>

      <div class="modal-body">
        <label>
          Project Name
          <input
            type="text"
            bind:value={newProjectName}
            placeholder="My Awesome Track"
            on:keydown={(e) => e.key === 'Enter' && createProject()}
            autofocus
          />
        </label>

        {#if error}
          <p class="error-text">{error}</p>
        {/if}
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" on:click={() => showNewProjectDialog = false}>
          Cancel
        </button>
        <button class="btn-primary" on:click={createProject} disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Project'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
.project-manager {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2rem;
  font-weight: 600;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.sort-select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.project-card {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.2s;
  cursor: pointer;
}

.project-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.project-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.project-menu {
  position: relative;
}

.menu-btn {
  padding: 0.25rem 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
}

.dropdown {
  display: none;
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 150px;
  z-index: 10;
}

.project-menu:hover .dropdown {
  display: block;
}

.dropdown button {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
}

.dropdown button:hover {
  background: #f5f5f5;
}

.dropdown button.danger {
  color: #dc2626;
}

.project-info {
  margin-bottom: 1rem;
}

.date {
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.stats {
  color: #999;
  font-size: 0.875rem;
}

.project-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #2563eb;
  border: 1px solid #2563eb;
}

.btn-secondary:hover {
  background: #eff6ff;
}

.loading {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-state p {
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 1rem;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-message button {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 1.25rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 0.75rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e5e5;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.modal-body input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  margin-top: 0.5rem;
}

.error-text {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e5e5;
}
</style>

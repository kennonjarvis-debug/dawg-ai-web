<script lang="ts">
  /**
   * BrowserPanel - File/sample/preset browser
   */
  import Icon from '../atoms/Icon.svelte';
  import Input from '../atoms/Input.svelte';
  import Label from '../atoms/Label.svelte';

  type BrowserItem = {
    id: string;
    name: string;
    type: 'folder' | 'audio' | 'midi' | 'preset' | 'plugin';
    path?: string;
    icon?: string;
    children?: BrowserItem[];
  };

  type BrowserPanelProps = {
    items?: BrowserItem[];
    selectedId?: string;
    onSelect?: (item: BrowserItem) => void;
    onDoubleClick?: (item: BrowserItem) => void;
  };

  let {
    items = [],
    selectedId = '',
    onSelect,
    onDoubleClick
  }: BrowserPanelProps = $props();

  let searchQuery = $state('');
  let expandedFolders = $state<Set<string>>(new Set());

  const filteredItems = $derived(
    items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  function handleSelect(item: BrowserItem) {
    onSelect?.(item);
  }

  function handleDoubleClick(item: BrowserItem) {
    if (item.type === 'folder') {
      toggleFolder(item.id);
    } else {
      onDoubleClick?.(item);
    }
  }

  function toggleFolder(id: string) {
    if (expandedFolders.has(id)) {
      expandedFolders.delete(id);
    } else {
      expandedFolders.add(id);
    }
    expandedFolders = new Set(expandedFolders);
  }

  const typeIcons: Record<BrowserItem['type'], string> = {
    folder: 'folder',
    audio: 'audio',
    midi: 'midi',
    preset: 'settings',
    plugin: 'waveform'
  };
</script>

<div class="browser-panel glass-strong rounded-panel p-4">
  <Label size="lg" weight="bold" class="mb-4 block">Browser</Label>

  <!-- Search -->
  <div class="mb-4">
    <Input
      type="search"
      placeholder="Search..."
      bind:value={searchQuery}
      size="sm"
    />
  </div>

  <!-- Items list -->
  <div class="browser-items flex flex-col gap-1 overflow-y-auto custom-scrollbar max-h-96">
    {#if filteredItems.length === 0}
      <div class="glass rounded-control p-4 text-center">
        <Label size="sm" color="var(--color-text-secondary)">
          No items found
        </Label>
      </div>
    {:else}
      {#each filteredItems as item (item.id)}
        <button
          class="
            browser-item
            glass
            rounded-control
            p-2
            flex
            items-center
            gap-2
            hover:glass-purple
            transition-all
            cursor-pointer
            {selectedId === item.id ? 'ring-2 ring-accent-primary' : ''}
          "
          onclick={() => handleSelect(item)}
          ondblclick={() => handleDoubleClick(item)}
        >
          <Icon name={item.icon || typeIcons[item.type]} size="sm" />
          <Label size="sm" class="flex-1 text-left truncate">{item.name}</Label>
          {#if item.type === 'folder'}
            <Icon
              name="chevronRight"
              size="sm"
              class="transition-transform {expandedFolders.has(item.id) ? 'rotate-90' : ''}"
            />
          {/if}
        </button>

        {#if item.type === 'folder' && expandedFolders.has(item.id) && item.children}
          <div class="ml-4">
            {#each item.children as child (child.id)}
              <button
                class="
                  browser-item
                  glass
                  rounded-control
                  p-2
                  flex
                  items-center
                  gap-2
                  hover:glass-purple
                  transition-all
                  cursor-pointer
                  mt-1
                  {selectedId === child.id ? 'ring-2 ring-accent-primary' : ''}
                "
                onclick={() => handleSelect(child)}
                ondblclick={() => handleDoubleClick(child)}
              >
                <Icon name={child.icon || typeIcons[child.type]} size="sm" />
                <Label size="sm" class="flex-1 text-left truncate">{child.name}</Label>
              </button>
            {/each}
          </div>
        {/if}
      {/each}
    {/if}
  </div>
</div>

<style>
  .browser-panel {
    min-width: 250px;
    max-width: 400px;
  }

  .browser-item {
    text-align: left;
  }
</style>

<script>
  import { fly } from 'svelte/transition'

  export let progress = 0

  let progressbar

  $: if (progressbar) {
    progressbar.style.width = progress + '%'
  }
</script>

<div class="bar-wrapper">
  {#if progress % 100 != 0}
    <div out:fly={{ y: -10, duration: 600 }} class="loaded-content" bind:this={progressbar}></div>
  {/if}
</div>

<style>
  .loaded-content {
    background: var(--color-secondary-container);
    height: 100%;
    width: 0;
    transition: width 0.25s linear;
  }

  .bar-wrapper {
    height: 0.25rem;
    width: 100%;
  }
</style>

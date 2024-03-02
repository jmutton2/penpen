<script>
  import Lightmode from '../assets/svg/lightmode.svg.svelte'
  import LightmodeFilled from '../assets/svg/lightmode_filled.svg.svelte'
  import Darkmode from '../assets/svg/darkmode.svg.svelte'
  import DarkmodeFilled from '../assets/svg/darkmode_filled.svg.svelte'

  import { fly } from 'svelte/transition'
  import { onMount } from 'svelte'

  let hovered = false

  export let mode = localStorage.getItem('theme') || 'dark'

  onMount(() => {
    if (mode === 'dark') {
      window.document.body.classList.add('dark')
    } else {
      window.document.body.classList.add('light')
    }
  })

  const handleClick = () => {
    if (mode === 'light') {
      mode = 'dark'
      window.document.body.classList.add('dark')
      window.document.body.classList.remove('light')
      localStorage.setItem('theme', 'dark')
    } else {
      mode = 'light'
      window.document.body.classList.add('light')
      window.document.body.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }
</script>

<div class="theme-fab-wrapper">
  <button
    type="button"
    class="theme-fab"
    class:light={mode === 'light'}
    class:dark={mode === 'dark'}
    on:click={handleClick}
    on:mouseenter={() => {
      hovered = true
    }}
    on:mouseleave={() => {
      hovered = false
    }}
  >
    {#if mode === 'light'}
      <div
        id="darkmode-wrapper"
        in:fly={{ y: 20, duration: 200 }}
        out:fly={{ y: 20, duration: 200 }}
      >
        {#if hovered}
          <DarkmodeFilled fill={'var(--color-neutral-90'} width={'25px'} />
        {:else}
          <Darkmode fill={'var(--color-neutral-90'} width={'25px'} />
        {/if}
      </div>
    {:else}
      <div
        id="lightmode-wrapper"
        in:fly={{ y: -20, duration: 200 }}
        out:fly={{ y: -20, duration: 200 }}
      >
        {#if hovered}
          <LightmodeFilled fill={'var(--color-neutral-90'} width={'25px'} />
        {:else}
          <Lightmode fill={'var(--color-neutral-90'} width={'25px'} />
        {/if}
      </div>
    {/if}
  </button>
</div>

<style>
  .theme-fab-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }

  .theme-fab {
    align-items: center;
    background: transparent;
    border-radius: 5rem;
    border: 1px solid lightgrey;
    display: flex;
    height: 56px;
    justify-content: center;
    padding: 2px;
    width: 56px;

    &:hover {
      background: var(--color-on-surface-variant-2);
      cursor: pointer;
    }
  }

  #lightmode-wrapper,
  #darkmode-wrapper {
    display: flex;
    justify-content: center;
    align-content: center;
  }

  #darkmode-wrapper {
    position: absolute;
    left: 2rem;
  }

  #lightmode-wrapper {
    position: absolute;
    left: 2rem;
  }
</style>

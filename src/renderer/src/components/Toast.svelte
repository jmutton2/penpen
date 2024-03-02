<script>
  import { fly } from 'svelte/transition'

  export let active = false
  export let message = 'This is toast!'

  $: if (active) {
    setTimeout(() => {
      active = false
    }, 5000)
  }
</script>

<div class="toast-box-wrapper">
  {#if active}
    <button
      on:click={() => (active = false)}
      in:fly={{ y: 20, duration: 200 }}
      out:fly={{ y: 20, duration: 200 }}
      class="toast-box"
    >
      {message}
    </button>
  {/if}
</div>

<style>
  .toast-box-wrapper {
    align-items: center;
    bottom: 0;
    display: flex;
    justify-content: center;
    min-height: 5rem;
    padding-left: 88px;
    position: fixed;
    width: 100%;
    z-index: 1;
  }

  .toast-box {
    background: var(--color-surface-2);
    border-radius: 0.75rem;
    border: 1px solid var(--color-surface-variant);
    color: var(--color-neutral-90);
    height: 3rem;
    margin: 1rem 2rem 1rem 1rem;
    padding: 0.5rem 1.5rem;
    width: 20rem;
    font-size: 1rem;

    &:hover {
      cursor: pointer;
    }
  }
</style>

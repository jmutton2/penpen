<script>
  import { push } from 'svelte-spa-router'

  export let page = '/'
  export let hovered = false

  import active from 'svelte-spa-router/active'
</script>

<button
  class="nav-button-wrapper"
  use:active={{ path: page, className: 'active', inactiveClassName: '' }}
  on:click={() => push(page)}
  on:mouseover={() => (hovered = true)}
  on:focus={() => (hovered = true)}
  on:mouseout={() => (hovered = false)}
  on:blur={() => (hovered = false)}
>
  <span type="button" class="nav-button-logo"><slot name="icon" /></span>
  <span class="nav-button-title"><slot name="label" /></span>
</button>

<style>
  .nav-button-wrapper {
    display: flex;
    flex-direction: column;
    height: 56px;
    width: 56px;
    justify-content: center;
    align-items: center;
    width: 100%;
    background: transparent;
    outline: 0;
    border: 0;
    margin-bottom: 1rem;

    &:hover > .nav-button-logo {
      background: var(--color-on-surface-variant-2);
      cursor: pointer;
    }

    &:hover {
      cursor: pointer;
    }

    &.active > .nav-button-title > span {
      color: var(--color-on-secondary-container);
      font-weight: bold;
    }

    &.active > .nav-button-logo {
      background: var(--color-secondary-container);
      transition: background-color 0.25s ease-in-out;

      &:hover {
        cursor: pointer;
      }
    }

    &.active > .nav-button-logo > svg {
      fill: var(--color-on-secondary-container);
    }
  }

  .nav-button-logo {
    width: 3.5rem;
    height: 2rem;
    border-radius: 2rem;
    margin-bottom: 0.25rem;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover > .nav-button-title {
      color: white;
    }
  }
  .nav-button-title {
    color: lightgray;
  }
</style>

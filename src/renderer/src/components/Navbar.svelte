<script>
  import Build from '../assets/svg/build.svg.svelte'
  import Cart from '../assets/svg/cart.svg.svelte'
  import Chat from '../assets/svg/chat.svg.svelte'
  import Home from '../assets/svg/home.svg.svelte'

  import Navbutton from './Navbutton.svelte'
  import Themebutton from './Themebutton.svelte'

  import { push } from 'svelte-spa-router'

  import { isHovered } from '../lib/store'

  let hovered = false

  $: if (hovered) {
    isHovered.set(true)
  } else {
    isHovered.set(false)
  }
</script>

<div class="left-nav-rail">
  <div class="nav-rail-content">
    <button class="menu-fab" on:click={() => push('/')}>
      <Home slot="icon" fill={'var(--color-neutral-90)'} width={'25px'} />
    </button>
    <Navbutton page={'/chat'} bind:hovered>
      <Chat slot="icon" fill={'var(--color-on-surface-variant)'} width={'25px'} />
      <span slot="label">Chat</span>
    </Navbutton>
    <Navbutton page={'/store'}>
      <Cart slot="icon" fill={'var(--color-on-surface-variant)'} width={'25px'} />
      <span slot="label">Store</span>
    </Navbutton>
    <Navbutton page={'/build'}>
      <Build slot="icon" fill={'var(--color-on-surface-variant)'} width={'25px'} />
      <span slot="label">Build</span>
    </Navbutton>
  </div>

  <Themebutton />
</div>

<style>
  .menu-fab {
    align-items: center;
    background: transparent;
    border-radius: 16px;
    border: 0;
    display: flex;
    height: 56px;
    justify-content: center;
    margin: -2px auto 24px;
    outline: 0;
    padding: 2px;
    width: 56px;

    &:hover {
      background: var(--color-tertiary-container);
      color: var(--color-on-tertiary-container);

      cursor: pointer;
    }

    &:hover > svg {
      fill: var(--color-neutral-90);
    }
  }

  .nav-rail-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-top: 20px;
  }

  .nav-rail-content span {
    color: var(--color-on-surface-variant);
  }

  .left-nav-rail {
    background: var(--color-surface-2);
    color: var(--color-on-surface-variant);
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-between;
    overflow-y: auto;
    position: fixed;
    width: 88px;
    z-index: 2;
  }
</style>

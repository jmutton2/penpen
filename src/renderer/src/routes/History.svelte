<script>
  import { fly } from 'svelte/transition'
</script>

<div class:expanded={true} class="navigation-drawer" in:fly={{ x: -50, duration: 500 }}>
  <div class="navbar-content">
    <button class="navbar-link"> This is some history</button>
    <button class="navbar-link"> This is some history</button>
    <button class="navbar-link"> This is some history</button>
    <button class="navbar-link"> This is some history</button>
    <button class="navbar-link"> This is some history</button>
  </div>
</div>

<div class="content-wrapper" in:fly={{ y: 20, duration: 600 }}>
  <div class="content">
    <div class="home-content-wrapper">
      <div class="home-content">
        <h1 class="home-title">History</h1>
      </div>
    </div>
  </div>
</div>

<style>
  .navbar-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem 0 0 0;
  }

  .navbar-link {
    outline: 0;
    border: 0;
    background: transparent;
    min-height: 3rem;
    width: 100%;
    color: white;
    text-align: left;
    padding: 0 0.75rem;
    border-radius: 2rem;
    margin: 0 0.5rem;
    max-width: -moz-available;
    max-width: -webkit-fill-available;

    &:hover {
      background: #393c3c;
      cursor: pointer;
    }
  }

  .home-title {
    font-size: 4em;
    color: var(--color-neutral-90);
  }

  .home-content {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .home-content-wrapper {
    background: var(--color-secondary-variant);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
    border-radius: 24px;
    margin: 0.25rem;
    min-height: 556px;
  }

  .content-wrapper {
    padding-left: 340px;
  }
</style>

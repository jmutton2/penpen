<script>
  import Navbar from '../components/Navbar.svelte'
  import { fly } from 'svelte/transition'
</script>

<Navbar />

<div class="content-wrapper" in:fly={{ y: 20, duration: 600 }}>
  <div class="content">
    <div class="home-content-wrapper">
      <div class="home-content">
        <h1 class="home-title">Build</h1>
      </div>
    </div>
  </div>
</div>

<style>
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
</style>

<script>
  import Router from 'svelte-spa-router'

  import Build from './routes/Build.svelte'
  import Chat from './routes/Chat.svelte'
  import Home from './routes/Home.svelte'
  import Navbar from './components/Navbar.svelte'
  import NotFound from './routes/NotFound.svelte'
  import Store from './routes/Store.svelte'

  const routes = {
    '/': Home,

    '/chat': Chat,

    '/build': Build,

    '/store': Store,

    '*': NotFound
  }
</script>

<Navbar />

<Router {routes} />

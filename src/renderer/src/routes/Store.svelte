<script>
  import { fly } from 'svelte/transition'
  import Download from '../assets/svg/download.svg.svelte'

  import { models } from '../assets/json/store'
  import Progressbar from '../components/Progressbar.svelte'
  import Toast from '../components/Toast.svelte'
  import { availableModels } from '../lib/store'

  import { ollamaEndpoint } from '../lib/store'
  import { onMount } from 'svelte'

  const enc = new TextDecoder('utf-8')

  let progress = 0
  let currentStatus = ''
  let toast_active = false
  let toast_message = ''

  onMount(() => {
    availableModels.refresh()
  })

  const deleteModel = (model) => {
    window.electron.ipcRenderer.send('delete_model', {
      model
    })
  }

  const pullModel = (model) => {
    availableModels.refresh()
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: model
      })
    }

    const response = fetch($ollamaEndpoint + '/api/pull', requestOptions)

    Promise.resolve(response).then((response) => {
      const reader = response.body.getReader()

      return new ReadableStream({
        start(controller) {
          return pump()
          function pump() {
            return reader.read().then(({ done, value }) => {
              if (done) {
                availableModels.refresh()
                setTimeout(() => {
                  currentStatus = ''
                  progress = 0
                }, 3000)
                controller.close()
                return
              }

              let payload = ''

              enc
                .decode(value)
                .split('\n')
                .map((jsonString) => {
                  if (jsonString !== '') {
                    payload = JSON.parse(jsonString)
                  }
                })

              currentStatus = { model: model, status: payload.status }
              progress = parseInt((payload.completed / payload.total) * 100)

              controller.enqueue(value)
              return pump()
            })
          }
        }
      })
    })
  }

  window.electron.ipcRenderer.on('delete_model_response', function (evt, message) {
    availableModels.refresh()
    toast_message = message
    toast_active = true
  })
</script>

<Progressbar bind:progress />
<Toast bind:active={toast_active} message={toast_message} />

<div class="content-wrapper" in:fly={{ y: 20, duration: 600 }}>
  <div class="home-content-wrapper">
    <div class="home-content">
      <h1 class="home-title">Store</h1>
    </div>
  </div>
  <div class="content">
    {#each models as model}
      <div class="store-item-wrapper">
        <div class="store-item">
          <div class="store-header-wrapper">
            <h2 class="store-header">{model.name}</h2>
            {#if $availableModels.some((m) => m.name.split(':')[0] === model.name)}
              <button
                class="download-fab"
                class:disabled={currentStatus !== ''}
                disabled={currentStatus !== ''}
                on:click={() => deleteModel(model.name)}
                ><Download fill={'var(--color-neutral-90)'} width={'20px'} /> Delete</button
              >
            {:else}
              <button
                class="download-fab"
                class:disabled={currentStatus !== ''}
                disabled={currentStatus !== ''}
                on:click={() => pullModel(model.name)}
                ><Download fill={'var(--color-neutral-90)'} width={'20px'} /> Download</button
              >
            {/if}
          </div>
          <p class="store-description">{model.description}</p>
          <div class="store-header-wrapper">
            <div class="store-info-wrapper">
              <span class="store-pulls"
                ><Download fill={'var(--color-neutral-90)'} width={'15px'} />{model.pulls} pulls</span
              >
              <span class="store-tags">{model.tags} Tags</span>
              <span class="store-last-updated">{model.last_updated}</span>
            </div>
            {#if currentStatus.model === model.name}
              <div class="download-status">{currentStatus.status}</div>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .download-fab {
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    outline: 0;
    border: 0px;
    background: transparent;
    color: var(--color-neutral-90);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;

    &:hover:not(.disabled) {
      background: var(--color-on-surface-variant-2);
      cursor: pointer;
    }
  }

  .download-fab:disabled {
    opacity: 0.1;
  }

  .store-header-wrapper {
    display: flex;
    justify-content: space-between;
  }

  .store-item-wrapper {
    display: flex;
    align-items: baseline;
    border-bottom: 1px solid var(--color-on-surface-variant-2);
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
    color: var(--color-neutral-90);
  }

  .store-item {
    width: 100%;
    color: inherit;
  }

  .store-header {
    font-size: 1.5rem;
    line-height: 2rem;
    text-underline-offset: 2px;
    font-weight: 500;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    margin-bottom: 0.75rem;
  }

  .store-description {
    max-width: 28rem;
    margin-bottom: 1rem;
  }

  .store-info-wrapper {
    font-weight: 500;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    display: flex;
  }

  .store-pulls {
    align-items: center;
    display: flex;
  }

  .store-tags {
    align-items: center;
    display: flex;
    margin-left: 1rem;
  }

  .store-last-updated {
    align-items: center;
    display: flex;
    margin-left: 1rem;
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
    margin: 0.25rem auto;
    min-height: 556px;
    transition: min-height 0.25s ease-in-out;
    min-width: 1400px;
    max-width: 1500px;
  }

  @media only screen and (max-width: 1505px) {
    .home-content-wrapper {
      min-width: 0px;
      width: 100%;
      min-height: 225px;
      transition: min-height 0.25s ease-in-out;
    }
  }
</style>

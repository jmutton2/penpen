<script>
  import { onMount } from 'svelte'
  import Send from '../assets/svg/send.svg.svelte'
  import Download from '../assets/svg/download.svg.svelte'
  import { fly } from 'svelte/transition'
  import Close from '../assets/svg/close.svg.svelte'
  import Add from '../assets/svg/add.svg.svelte'

  import { availableModels, isHovered } from '../lib/store'

  import { ollamaEndpoint } from '../lib/store'

  let content = ''
  let enc = new TextDecoder('utf-8')
  let live_string = ''
  let model = 'llama2:latest'
  let responses = []
  let textarea
  let chat_date = ''

  let innerHeight = 0
  let innerWidth = 0

  let chat_history = []

  const delete_history_item = (date) => {
    window.electron.ipcRenderer.send('delete_history_item', {
      model,
      chat_date: date
    })

    const index = chat_history.indexOf(date)
    if (index > -1) {
      chat_history.splice(index, 1)
      chat_history = chat_history
    }
  }

  const save_chat = () => {
    if (responses.length > 0 && live_string === '') {
      chat_date = getCurrentFormattedDate()
      window.electron.ipcRenderer.send('save_chat', {
        model,
        chat_date,
        entry: responses
      })
      chat_history.push(chat_date + '.txt')
      chat_history = chat_history
    }
  }

  const load_chat = (file_name) => {
    window.electron.ipcRenderer.send('load_chat', { model, chat_date: file_name })
  }

  let expanded = false

  $: if (innerWidth < 1200) {
    if ($isHovered) {
      expanded = true
    } else {
      expanded = false
    }
  } else {
    expanded = true
  }

  $: window.electron.ipcRenderer.send('load_chat_history', {
    model
  })

  const startNewChat = () => {
    responses = []
    live_string = ''
  }

  function getCurrentFormattedDate() {
    const now = new Date()

    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')

    const formattedDate = `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`
    return formattedDate
  }

  const handleClick = () => {
    if (textarea) {
      textarea.style.height = '50px'
    }

    responses.push({ role: 'user', content: content })
    responses = responses

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        messages: responses
      })
    }

    const response = fetch($ollamaEndpoint + '/api/chat', requestOptions)

    Promise.resolve(response).then((response) => {
      const reader = response.body.getReader()

      return new ReadableStream({
        start(controller) {
          return pump()
          function pump() {
            return reader.read().then(({ done, value }) => {
              if (done) {
                if (responses.length > 0) {
                  responses.push({ role: 'assistant', content: live_string })
                  responses = responses
                }

                live_string = ''
                controller.close()
                return
              }

              live_string = live_string.concat(JSON.parse(enc.decode(value)).message.content)
              controller.enqueue(value)
              return pump()
            })
          }
        }
      })
    })
    content = ''
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && content !== '') {
      e.preventDefault()
      handleClick()
    }
  }

  const autoResizeTextarea = () => {
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + 'px'
    }
  }

  onMount(async () => {
    availableModels.refresh()

    window.electron.ipcRenderer.send('load_chat_history', {
      model
    })
  })

  window.electron.ipcRenderer.on('loaded_chat_log', function (evt, message) {
    responses = message
  })

  window.electron.ipcRenderer.on('loaded_chat_history', function (evt, message) {
    chat_history = message
  })
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div
  class:expanded
  tabindex="0"
  role="button"
  class="navigation-drawer"
  in:fly={{ x: -50, duration: 500 }}
  on:mouseenter={() => {
    isHovered.set(true)
  }}
  on:mouseleave={() => {
    isHovered.set(false)
  }}
>
  <div class="navbar-content">
    <button class="new-chat-button" on:click={() => startNewChat()}
      ><Add fill={'var(--color-neutral-90)'} width={'15px'} /> Start a new chat</button
    >
    <div class="models-section">
      {#each $availableModels as m}
        <button
          class:active={model === m.name}
          class="navbar-link"
          on:click={() => {
            model = m.name
          }}
        >
          {m.name}</button
        >
      {/each}
    </div>

    <div class="history-section">
      {#if chat_history}
        {#each chat_history as history_item}
          <button
            class="navbar-link"
            on:click={() => {
              load_chat(history_item)
            }}
          >
            {history_item}<button
              on:click|stopPropagation={() => {
                delete_history_item(history_item)
              }}
              class="delete-history-item"
              ><Close slot="icon" fill={'var(--color-on-surface-variant)'} width={'20px'} /></button
            ></button
          >
        {/each}
      {/if}
    </div>
  </div>
</div>

<div class="content-wrapper" in:fly={{ y: 20, duration: 600 }}>
  <div class="content">
    <button
      class="download-fab"
      disabled={responses.length == 0 || live_string != ''}
      on:click={() => {
        save_chat()
      }}><Download fill={'var(--color-neutral-90)'} width={'25px'} /></button
    >
    <div class="chat-box">
      {#if responses.length > 0}
        <div class="chat-box-content">
          <div class="chat-stream-container">
            {#each responses as resp}
              <p class="chat-stream-item">{resp.content}</p>
            {/each}
            {#if live_string != ''}
              <p class="chat-stream-item">{live_string}</p>
            {/if}
          </div>
        </div>
      {:else}
        <div></div>
        <div class="chat-preface">
          <h1>You are chatting with {model}</h1>
          <h2>Type a message to begin</h2>
        </div>
      {/if}

      <div class="chat-search-box-wrapper">
        <div class="chat-search-box">
          <textarea
            type="text"
            class="chat-search-input"
            placeholder="Enter some text..."
            bind:value={content}
            on:input={autoResizeTextarea}
            on:keydown={handleKeyPress}
            bind:this={textarea}
            rows="1"
          />
          <button
            type="submit"
            class="chat-search-submit"
            disabled={content === ''}
            on:click|preventDefault={handleClick}
          >
            <Send fill={'var(--color-neutral-90)'} width={'25px'} />
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  h1,
  h2 {
    color: var(--color-neutral-90);
  }

  .delete-history-item {
    outline: 0;
    border: 0;
    border-radius: 1rem;
    background: transparent;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
      cursor: pointer;
    }

    &:hover > svg {
      fill: var(--color-on-secondary-container);
    }
  }

  .models-section {
    border-top: 1px solid var(--color-on-surface-variant-2);
    padding-top: 0.5rem;
    margin-top: 0.5rem;
  }

  .navbar-link.active {
    background: red;
    background: var(--color-secondary-container);
  }

  .history-section {
    border-top: 1px solid var(--color-on-surface-variant-2);
    padding-top: 0.5rem;
    margin-top: 0.5rem;
  }

  .new-chat-button {
    background: transparent;
    border: 1px solid var(--color-on-surface-variant-2);
    color: var(--color-neutral-90);
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin: 0.25rem 0.5rem;
    outline: 0;
    padding: 0.5rem 0.75rem;
    border-radius: 1rem;

    &:hover {
      background: var(--color-on-surface-variant-2);
      cursor: pointer;
    }
  }

  .download-fab {
    position: absolute;
    right: 0;
    top: 0;
    margin: 1rem;
    padding: 0.1rem 0.5rem;
    border-radius: 0.5rem;
    outline: 0;
    border: 0px;
    background: transparent;
    color: var(--color-neutral-90);

    &:hover:not(.disabled) {
      background: var(--color-on-surface-variant-2);
      cursor: pointer;
    }
  }

  .download-fab:disabled {
    opacity: 0.1;
  }

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
    color: var(--color-neutral-90);
    text-align: left;
    padding: 0 0.75rem;
    border-radius: 2rem;
    margin: 0 0.5rem;
    max-width: -moz-available;
    max-width: -webkit-fill-available;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:hover:not(.active) {
      background: var(--color-on-surface-variant-2);
    }

    &:hover {
      cursor: pointer;
    }
  }

  .chat-preface {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  .chat-stream-item {
    background: var(--color-surface-1);
    color: var(--color-neutral-90);
    border-radius: 15px;
    margin: 1rem 1rem 0;
    padding: 2rem;
  }

  .chat-stream-container {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding-bottom: 1rem;
  }

  .chat-search-submit {
    background: transparent;
    border-radius: 15px;
    border: 0;
    bottom: 0.32rem;
    display: flex;
    outline: none;
    padding: 0.1rem 0.5rem 0.1rem 0.75rem;
    position: absolute;
    right: 0.75rem;
    transition: opacity 0.2s linear;

    &:hover:not(:disabled) {
      background: var(--color-on-surface-variant-2);
      cursor: pointer;
    }
  }

  .chat-search-submit:disabled {
    opacity: 0.1;
  }

  .chat-search-input {
    background: var(--color-surface-2);
    border: 0;
    color: var(--color-neutral-90);
    display: block;
    font-family: inherit;
    font-size: 1.25rem;
    font-size: 100%;
    font-weight: inherit;
    height: auto;
    line-height: inherit;
    margin: 0;
    max-height: 200px;
    outline: none;
    overflow-y: hidden;
    overflow: hidden;
    padding: 0.875rem 6rem 0.875rem 3rem;
    resize: none;
    width: 100%;
  }

  .chat-search-box {
    border-radius: 2rem;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow: hidden;
    position: relative;
    width: 100%;
  }

  .chat-search-box-wrapper {
    align-items: center;
    display: flex;
    margin-bottom: 1rem;
    width: 100%;
  }

  .chat-box-content {
    box-sizing: content-box;
    height: 100%;
    overflow-y: scroll;
    padding-right: 17px;
    width: 100%;
  }

  .chat-box {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-between;
    margin: 1rem auto;
    max-width: 780px;
    min-width: 200px;
    overflow: hidden;
    width: 100%;
  }

  @media only screen and (min-width: 1200px) {
    .content-wrapper {
      padding-left: 340px;
    }
  }

  @media only screen and (max-width: 900px) {
    .chat-search-box {
      margin: 0 1rem;
    }
  }
</style>

import { writable } from 'svelte/store'

export const isHovered = writable(false)

export const ollamaEndpoint = writable('http://localhost:11434')

export const availableModels = (() => {
  const { subscribe, set } = writable([])

  const refresh = async () => {
    let endpoint
    ollamaEndpoint.subscribe((value) => (endpoint = value))

    const response = await fetch(endpoint + '/api/tags')
    const data = await response.json()
    set(data.models)
  }

  return {
    subscribe,
    refresh
  }
})()

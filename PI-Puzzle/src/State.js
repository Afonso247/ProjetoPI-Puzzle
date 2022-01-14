import { writable } from 'svelte/store'

export let state = writable("menu")

export function trocarStateDoJogo(newState) {
	state.set(newState)
}
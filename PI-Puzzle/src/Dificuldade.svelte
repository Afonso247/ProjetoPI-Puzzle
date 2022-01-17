<svelte:head>
	<link rel="stylesheet" href="/styles/dificuldade.css">
</svelte:head>

<script>
	import { state } from './State.js'
	import { trocarStateDoJogo } from './State.js'
	import VoltarMenu from './VoltarMenu.svelte'
</script>

<body>
	<h1>
		Selecione uma dificuldade
	</h1>
	
	<button type="button">
		<div class='dificuldade' on:click={() => trocarStateDoJogo('jogarA')}>
			Fácil
		</div>
	</button>

	<button type="button">
		<div class='dificuldade' on:click={() => trocarStateDoJogo('jogarB')}>
			Normal
		</div>
	</button>

	<button type="button">
		<div class='dificuldade' on:click={() => trocarStateDoJogo('jogarC')}>
			Difícil
		</div>
	</button>

	<button type="button" style="margin-bottom: 100px;">
		<div class='dificuldade' on:click={() => trocarStateDoJogo('jogarD')}>
			Muito Difícil
		</div>
	</button>

	<VoltarMenu/>
</body>

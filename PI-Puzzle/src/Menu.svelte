<svelte:head>
	<link rel="stylesheet" href="/styles/menu.css">
</svelte:head>

<script>
	import { state } from './State.js'
	import { trocarStateDoJogo } from './State.js'
</script>

<body>
	<h1>
		Puzzle - Quebra Cabeça
	</h1>
	
	<button type="button">
		<div class='menu' on:click={() => trocarStateDoJogo('dificuldade')}>
			Jogar
		</div>
	</button>

	<button type="button">
		<div class='menu' on:click={() => trocarStateDoJogo('ajuda')}>
			Ajuda
		</div>
	</button>
	
	<button type="button">
		<div class='menu' on:click={() => trocarStateDoJogo('sobre')}>
			Sobre
		</div>
	</button>
</body>
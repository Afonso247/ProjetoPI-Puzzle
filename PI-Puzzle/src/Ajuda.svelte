<svelte:head>
	<link rel="stylesheet" href="/styles/ajuda.css">
</svelte:head>

<script>
    import VoltarMenu from "./VoltarMenu.svelte"
</script>

<h1>Ajuda</h1>

<body>
    <p>
        O Quebra-Cabeça é um jogo de raciocínio lógico. O objetivo é pegar e juntar as peças de 
        um modo ordenado, formando assim uma imagem completa.
    </p>
    
    <img src="images/ayaka.jpg" alt="Uma imagem." width="300" height="400">
    
    <p>
        Acima há uma ilustração que será utilizada no quebra-cabeça. Ela será 
        exibida durante o jogo.
    </p>
    
    <p>
        Ao entrar no jogo, a figura será dividida em pedaços, embaralhadas de forma aleatória.
        Seu objetivo é juntar os pedaços para que a imagem original seja formada.
    </p>
    
    <h2>Boa sorte!</h2>
    
    <VoltarMenu/>
</body>

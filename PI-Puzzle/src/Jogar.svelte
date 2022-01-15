<svelte:head>
	<link rel="stylesheet" href="/styles/jogo.css">
</svelte:head>

<script>
	import VoltarMenu from './VoltarMenu.svelte'

	// Esta classe representa o estado da tela jogar,
	// ela guarda o estado da tabela.
	class EstadoTabela {
		constructor(tabela) {
			this.tabela = tabela
		}
	}


	// Duas variaveis iguais, sendo que somente a segunda está sujeita a mudanças
	let tabelaReal = [
		["/images/division/1.jpg","/images/division/2.jpg","/images/division/3.jpg","/images/division/4.jpg","/images/division/5.jpg","/images/division/6.jpg"],
		["/images/division/7.jpg","/images/division/8.jpg","/images/division/9.jpg","/images/division/10.jpg","/images/division/11.jpg","/images/division/12.jpg"],
		["/images/division/13.jpg","/images/division/14.jpg","/images/division/15.jpg","/images/division/16.jpg","/images/division/17.jpg","/images/division/18.jpg"]
	]

	let tabela = [
		["/images/division/1.jpg","/images/division/2.jpg","/images/division/3.jpg","/images/division/4.jpg","/images/division/5.jpg","/images/division/6.jpg"],
		["/images/division/7.jpg","/images/division/8.jpg","/images/division/9.jpg","/images/division/10.jpg","/images/division/11.jpg","/images/division/12.jpg"],
		["/images/division/13.jpg","/images/division/14.jpg","/images/division/15.jpg","/images/division/16.jpg","/images/division/17.jpg","/images/division/18.jpg"]
	]

	function embaralhar(tabela) { // Embaralha todas as peças do quebra-cabeça
    for (var k = 0; k < tabela.length; k++) {
        var i = tabela[k].length;
        if (i == 0)
            return false;
        else {
            while (--i) {
                var j = Math.floor(Math.random() * (i + 1));
                var tempi = tabela[k][i];
                var tempj = tabela[k][j];
                tabela[k][i] = tempj;
                tabela[k][j] = tempi;
            }
        }
    }
    return tabela
}

	// toda vez que entramos na tela de jogar o estado do jogo é resetado
	let estadoTabela = new EstadoTabela(tabela)


	// Uma tremenda gambiarra de armazenamento de valores
	let chosen1 = null
	let chosen2 = null
    let k = null
    let l = null
    let m = null
    let n = null

	function clicarPeca(i, j) { // Função que permite o usuário a selecionar a peça
    	if (chosen1 == null) {
            k = i
            l = j
        	chosen1 = tabela[k][l]
    	} else if (chosen2 == null) {
            m = i
            n = j
        	chosen2 = tabela[m][n]

            atualizarTabela()
    	}
	}
	

	// Esta função atualiza o quebra cabeça, de acordo com as peças que o usuário selecionou
	function atualizarTabela() {

        let temp = estadoTabela.tabela[k][l]
        estadoTabela.tabela[k][l] = estadoTabela.tabela[m][n]
        estadoTabela.tabela[m][n] = temp

		// Os valores da gambiarra são resetados para que uma próxima troca possa ocorrer
        chosen1 = null
        chosen2 = null
        k = null
        l = null
        m = null
        n = null

		// Após a troca, ocorre a validação
		validar(tabela,tabelaReal)
		}

	
	
	// Função que valida se as todas as peças estão no seu lugar
	function validar(tabela,tabelaReal) { 
		let checkin = 0
		for (let i = 0; i < tabela.length; i++) {
			for (let j = 0; j < tabela[i].length; j++) {
				if (tabela[i][j] == tabelaReal[i][j]) {
					checkin++
				}
			}
		}
		if (checkin == tabela.length * tabela[1].length) {
			alert("Parabéns, você conseguiu resolver!!")
		}
	}

	embaralhar(tabela) // Ativa a função do embaralhamento

</script>


<h1 style="color: white;">
	Imagem original
</h1>

<!-- Display da imagem original -->
<img style="width: 50%; margin-bottom: 50px;" src="/images/ayaka.jpg" alt="">

<h1 style="color: white;">
	Boa sorte!
</h1>

<!-- Criação da tabela de forma dinâmica, similar aos laços duplos do node.js -->
<table>
	{#each estadoTabela.tabela as linha, i}
		<tr>
			{#each linha as dado, j}
				<td id={`${i}-${j}`} on:click={() => clicarPeca(i,j)}>
					<!-- {dado} -->
					<img src={dado} alt="">
				</td>
			{/each}
		</tr>
	{/each}
</table>

<br>

<!-- Reaproveita o botão de voltar para o menu -->
<VoltarMenu/>

<p>
	Ao voltar para o menu, seu progresso atual será perdido.
</p>

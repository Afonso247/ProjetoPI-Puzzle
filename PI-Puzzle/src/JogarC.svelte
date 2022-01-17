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
		["/images/divisionC/1.jpg","/images/divisionC/2.jpg","/images/divisionC/3.jpg","/images/divisionC/4.jpg","/images/divisionC/5.jpg","/images/divisionC/6.jpg","/images/divisionC/7.jpg","/images/divisionC/8.jpg","/images/divisionC/9.jpg","/images/divisionC/10.jpg"],
		["/images/divisionC/11.jpg","/images/divisionC/12.jpg","/images/divisionC/13.jpg","/images/divisionC/14.jpg","/images/divisionC/15.jpg","/images/divisionC/16.jpg","/images/divisionC/17.jpg","/images/divisionC/18.jpg","/images/divisionC/19.jpg","/images/divisionC/20.jpg"],
		["/images/divisionC/21.jpg","/images/divisionC/22.jpg","/images/divisionC/23.jpg","/images/divisionC/24.jpg","/images/divisionC/25.jpg","/images/divisionC/26.jpg","/images/divisionC/27.jpg","/images/divisionC/28.jpg","/images/divisionC/29.jpg","/images/divisionC/30.jpg"],
        ["/images/divisionC/31.jpg","/images/divisionC/32.jpg","/images/divisionC/33.jpg","/images/divisionC/34.jpg","/images/divisionC/35.jpg","/images/divisionC/36.jpg","/images/divisionC/37.jpg","/images/divisionC/38.jpg","/images/divisionC/39.jpg","/images/divisionC/40.jpg"],
        ["/images/divisionC/41.jpg","/images/divisionC/42.jpg","/images/divisionC/43.jpg","/images/divisionC/44.jpg","/images/divisionC/45.jpg","/images/divisionC/46.jpg","/images/divisionC/47.jpg","/images/divisionC/48.jpg","/images/divisionC/49.jpg","/images/divisionC/50.jpg"]
	]

	let tabela = [
		["/images/divisionC/1.jpg","/images/divisionC/2.jpg","/images/divisionC/3.jpg","/images/divisionC/4.jpg","/images/divisionC/5.jpg","/images/divisionC/6.jpg","/images/divisionC/7.jpg","/images/divisionC/8.jpg","/images/divisionC/9.jpg","/images/divisionC/10.jpg"],
		["/images/divisionC/11.jpg","/images/divisionC/12.jpg","/images/divisionC/13.jpg","/images/divisionC/14.jpg","/images/divisionC/15.jpg","/images/divisionC/16.jpg","/images/divisionC/17.jpg","/images/divisionC/18.jpg","/images/divisionC/19.jpg","/images/divisionC/20.jpg"],
		["/images/divisionC/21.jpg","/images/divisionC/22.jpg","/images/divisionC/23.jpg","/images/divisionC/24.jpg","/images/divisionC/25.jpg","/images/divisionC/26.jpg","/images/divisionC/27.jpg","/images/divisionC/28.jpg","/images/divisionC/29.jpg","/images/divisionC/30.jpg"],
        ["/images/divisionC/31.jpg","/images/divisionC/32.jpg","/images/divisionC/33.jpg","/images/divisionC/34.jpg","/images/divisionC/35.jpg","/images/divisionC/36.jpg","/images/divisionC/37.jpg","/images/divisionC/38.jpg","/images/divisionC/39.jpg","/images/divisionC/40.jpg"],
        ["/images/divisionC/41.jpg","/images/divisionC/42.jpg","/images/divisionC/43.jpg","/images/divisionC/44.jpg","/images/divisionC/45.jpg","/images/divisionC/46.jpg","/images/divisionC/47.jpg","/images/divisionC/48.jpg","/images/divisionC/49.jpg","/images/divisionC/50.jpg"]
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

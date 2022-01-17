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
		["/images/divisionD/1.jpg","/images/divisionD/2.jpg","/images/divisionD/3.jpg","/images/divisionD/4.jpg","/images/divisionD/5.jpg","/images/divisionD/6.jpg","/images/divisionD/7.jpg","/images/divisionD/8.jpg","/images/divisionD/9.jpg","/images/divisionD/10.jpg","/images/divisionD/11.jpg","/images/divisionD/12.jpg"],
		["/images/divisionD/13.jpg","/images/divisionD/14.jpg","/images/divisionD/15.jpg","/images/divisionD/16.jpg","/images/divisionD/17.jpg","/images/divisionD/18.jpg","/images/divisionD/19.jpg","/images/divisionD/20.jpg","/images/divisionD/21.jpg","/images/divisionD/22.jpg","/images/divisionD/23.jpg","/images/divisionD/24.jpg"],
		["/images/divisionD/25.jpg","/images/divisionD/26.jpg","/images/divisionD/27.jpg","/images/divisionD/28.jpg","/images/divisionD/29.jpg","/images/divisionD/30.jpg","/images/divisionD/31.jpg","/images/divisionD/32.jpg","/images/divisionD/33.jpg","/images/divisionD/34.jpg","/images/divisionD/35.jpg","/images/divisionD/36.jpg"],
        ["/images/divisionD/37.jpg","/images/divisionD/38.jpg","/images/divisionD/39.jpg","/images/divisionD/40.jpg","/images/divisionD/41.jpg","/images/divisionD/42.jpg","/images/divisionD/43.jpg","/images/divisionD/44.jpg","/images/divisionD/45.jpg","/images/divisionD/46.jpg","/images/divisionD/47.jpg","/images/divisionD/48.jpg"],
        ["/images/divisionD/49.jpg","/images/divisionD/50.jpg","/images/divisionD/51.jpg","/images/divisionD/52.jpg","/images/divisionD/53.jpg","/images/divisionD/54.jpg","/images/divisionD/55.jpg","/images/divisionD/56.jpg","/images/divisionD/57.jpg","/images/divisionD/58.jpg","/images/divisionD/59.jpg","/images/divisionD/60.jpg"],
		["/images/divisionD/61.jpg","/images/divisionD/62.jpg","/images/divisionD/63.jpg","/images/divisionD/64.jpg","/images/divisionD/65.jpg","/images/divisionD/66.jpg","/images/divisionD/67.jpg","/images/divisionD/68.jpg","/images/divisionD/69.jpg","/images/divisionD/70.jpg","/images/divisionD/71.jpg","/images/divisionD/72.jpg"]
	]

	let tabela = [
		["/images/divisionD/1.jpg","/images/divisionD/2.jpg","/images/divisionD/3.jpg","/images/divisionD/4.jpg","/images/divisionD/5.jpg","/images/divisionD/6.jpg","/images/divisionD/7.jpg","/images/divisionD/8.jpg","/images/divisionD/9.jpg","/images/divisionD/10.jpg","/images/divisionD/11.jpg","/images/divisionD/12.jpg"],
		["/images/divisionD/13.jpg","/images/divisionD/14.jpg","/images/divisionD/15.jpg","/images/divisionD/16.jpg","/images/divisionD/17.jpg","/images/divisionD/18.jpg","/images/divisionD/19.jpg","/images/divisionD/20.jpg","/images/divisionD/21.jpg","/images/divisionD/22.jpg","/images/divisionD/23.jpg","/images/divisionD/24.jpg"],
		["/images/divisionD/25.jpg","/images/divisionD/26.jpg","/images/divisionD/27.jpg","/images/divisionD/28.jpg","/images/divisionD/29.jpg","/images/divisionD/30.jpg","/images/divisionD/31.jpg","/images/divisionD/32.jpg","/images/divisionD/33.jpg","/images/divisionD/34.jpg","/images/divisionD/35.jpg","/images/divisionD/36.jpg"],
        ["/images/divisionD/37.jpg","/images/divisionD/38.jpg","/images/divisionD/39.jpg","/images/divisionD/40.jpg","/images/divisionD/41.jpg","/images/divisionD/42.jpg","/images/divisionD/43.jpg","/images/divisionD/44.jpg","/images/divisionD/45.jpg","/images/divisionD/46.jpg","/images/divisionD/47.jpg","/images/divisionD/48.jpg"],
        ["/images/divisionD/49.jpg","/images/divisionD/50.jpg","/images/divisionD/51.jpg","/images/divisionD/52.jpg","/images/divisionD/53.jpg","/images/divisionD/54.jpg","/images/divisionD/55.jpg","/images/divisionD/56.jpg","/images/divisionD/57.jpg","/images/divisionD/58.jpg","/images/divisionD/59.jpg","/images/divisionD/60.jpg"],
		["/images/divisionD/61.jpg","/images/divisionD/62.jpg","/images/divisionD/63.jpg","/images/divisionD/64.jpg","/images/divisionD/65.jpg","/images/divisionD/66.jpg","/images/divisionD/67.jpg","/images/divisionD/68.jpg","/images/divisionD/69.jpg","/images/divisionD/70.jpg","/images/divisionD/71.jpg","/images/divisionD/72.jpg"]
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

<script>
    import Jogo from "./Jogar.svelte"
    import Sobre from "./Sobre.svelte"
    import Ajuda from "./Ajuda.svelte"
    import Menu from "./Menu.svelte"

    import { state } from "./State.js"
</script>

{#if $state === "menu"} 
    <Menu/>
{:else if $state === "sobre"}
    <Sobre/>
{:else if $state === "ajuda"}
    <Ajuda/>
{:else if $state === "jogar"}
    <Jogo/>
{/if}
<script>
    import JogoA from "./JogarA.svelte"
    import JogoB from "./JogarB.svelte"
    import JogoC from "./JogarC.svelte"
    import Sobre from "./Sobre.svelte"
    import Ajuda from "./Ajuda.svelte"
    import Menu from "./Menu.svelte"
    import Dificuldade from "./Dificuldade.svelte";

    import { state } from "./State.js"
</script>

{#if $state === "menu"} 
    <Menu/>
{:else if $state === "sobre"}
    <Sobre/>
{:else if $state === "ajuda"}
    <Ajuda/>
{:else if $state === "dificuldade"}
    <Dificuldade/>
{:else if $state === "jogarA"}
    <JogoA/>
{:else if $state === "jogarB"}
    <JogoB/>
{:else if $state === "jogarC"}
    <JogoC/>
{/if}
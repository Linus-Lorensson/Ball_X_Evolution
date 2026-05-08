<script lang="ts">
	import { onDestroy, onMount, untrack } from "svelte";

    let value: number = $state(0);
    let doubleValue: number = $derived(value *2);
    let changes: number = $derived(-1); // see $effect for why this is -1

    onMount(() => {
        console.log("onMount() runs code on page/elemnt mount");
    });

    onDestroy(() => {
        console.log("onDestroy() runs code on page/elemnt close");
    });

    $effect(() => { // this will run on page creation so we need to account for it
        console.log(`New value: ${value}`);
        untrack(() => {
            changes += 1;
        });
    })

    // $props <- this allows us to pass a value to a component
    // $bindable <- this allows a prop to be bound between components

    function increment(positive: boolean = true){
        value += positive? 1 : -1;
    }

</script>

<p>value: {value}</p>
<p>doubleValue: {doubleValue}</p>
<p>changes: {changes}</p>

<button onclick={() => increment(true)}>+1</button>
<button onclick={() => increment(false)}>-1</button>
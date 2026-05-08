<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		createAllBalls, 
		getEvolutionBalls, 
		getEvolutionBallFromParents, 
		type Ball, 
		getAxisBalls
	} from '$lib/utils/balls';
	import ballData from '$lib/json/balls.json';
	import { assets } from '$app/paths';

	// Initialize balls and resolve references
	const allBalls = createAllBalls(ballData);
	let baseBalls = $derived(getAxisBalls(allBalls));
	let evolutionBalls = $derived(getEvolutionBalls(allBalls));

	const gridSize = $derived(baseBalls.length + 1);
	const totalCells = $derived(gridSize * gridSize);

	let scale = $state(0.3);
	let pos = $state({ x: 0, y: 0 });
	let isDragging = $state(false);
	let hasMoved = $state(false); 
	let dragStart = { x: 0, y: 0 };
	
	let showTooltip = $state(false);
	let selectedBall = $state<Ball | null>(null);
	let descExpanded = $state(false);
	const DESC_LIMIT = 200; 

	// Find balls where current selection is a parent
	let childEvolutions = $derived(
		selectedBall 
			? allBalls.filter(ball => 
				ball.parents?.some(group => 
					group.some(parent => parent.name === selectedBall?.name)
				)
			)
			: []
	);

	onMount(() => {
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const gridPixelSize = (gridSize * 100) + (gridSize - 1);
		const scaledGridSize = gridPixelSize * scale;

		pos = {
			x: (viewportWidth - scaledGridSize) / 2,
			y: (viewportHeight - scaledGridSize) / 2
		};
	});

	function getBallAtCoord(row: number, col: number): Ball | null {
		if (row === 0 && col === 0) return null;
		if (row === 0 || col === 0) {
			return baseBalls[(row || col) - 1];
		}
		const p1 = baseBalls[row - 1].name;
		const p2 = baseBalls[col - 1].name;
		return getEvolutionBallFromParents([p1, p2], evolutionBalls) || null;
	}

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		const target = e.currentTarget as HTMLElement;
		if (!target) return;
		const zoomSpeed = 0.001;
		const delta = -e.deltaY * zoomSpeed;
		const newScale = Math.min(Math.max(0.1, scale + delta), 4);
		const rect = target.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;
		const gridX = (mouseX - pos.x) / scale;
		const gridY = (mouseY - pos.y) / scale;
		scale = newScale;
		pos.x = mouseX - gridX * scale;
		pos.y = mouseY - gridY * scale;
	}

	function onMouseDown(e: MouseEvent) {
		if (e.button !== 0) return;
		isDragging = true;
		hasMoved = false; 
		dragStart = { x: e.clientX - pos.x, y: e.clientY - pos.y };
	}

	function onMouseMove(e: MouseEvent) {
		if (!isDragging) return;
		const dx = Math.abs(e.clientX - (dragStart.x + pos.x));
		const dy = Math.abs(e.clientY - (dragStart.y + pos.y));
		if (dx > 5 || dy > 5) hasMoved = true;

		pos.x = e.clientX - dragStart.x;
		pos.y = e.clientY - dragStart.y;
	}

	function onMouseUp() { 
		isDragging = false;
	}

	function handleCellClick(row: number, col: number) {
		if (hasMoved) return; 
		if (row === 0 && col === 0) return;
		
		descExpanded = false;
		if (row === 0 || col === 0) {
			const index = (row || col) - 1;
			selectedBall = baseBalls[index];
		} else {
			const parent1 = baseBalls[row - 1].name;
			const parent2 = baseBalls[col - 1].name;
			const fusion = getEvolutionBallFromParents([parent1, parent2], evolutionBalls);
			if (fusion) {
				selectedBall = fusion;
			} else {
				selectedBall = {
					name: "404 Evolution",
					description: `The combination of ${parent1} and ${parent2} is unknown, it might not exist. Maybe this is what destroyed Babylon...?`,
					img: "", 
					damageType: ["Null"],
					statusEffect: ["None"]
				};
			}
		}
		showTooltip = true;
	}

	function selectNewBall(ball: Ball) {
		selectedBall = ball;
		descExpanded = false;
	}
</script>

<div 
	class="w-full h-full cursor-grab active:cursor-grabbing touch-none select-none overflow-hidden bg-[#050507]"
	onwheel={handleWheel}
	onmousedown={onMouseDown}
	onmousemove={onMouseMove}
	onmouseup={onMouseUp}
	onmouseleave={onMouseUp}
	role="presentation"
>
	<div 
		class="inline-block origin-top-left transition-transform duration-75 ease-out"
		style="transform: translate({pos.x}px, {pos.y}px) scale({scale});"
	>
		<div 
			class="grid bg-[#1a1a1e] border border-indigo-900/30" 
			style="grid-template-columns: repeat({gridSize}, 100px); gap: 1px;"
		>
			{#each Array(totalCells) as _, i}
				{@const row = Math.floor(i / gridSize)}
				{@const col = i % gridSize}
				{@const cellBall = getBallAtCoord(row, col)}
				
				<button 
					type="button"
					onclick={() => handleCellClick(row, col)}
					class="aspect-square bg-[#0f0f12] hover:bg-[#16161d] flex items-center justify-center relative group transition-all duration-200"
				>
					{#if row === 0 && col === 0}
						<span class="text-indigo-500/20 text-[10px] font-bold tracking-widest">AXIS</span>
					{:else if cellBall && cellBall.img}
						<div class="w-full h-full p-2 {row === 0 || col === 0 ? 'bg-indigo-950/20' : ''}">
							<img src={cellBall.img} alt={cellBall.name} class="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
						</div>
					{:else if row > 0 && col > 0}
						<div class="opacity-10 group-hover:opacity-40 transition-opacity">
							<span class="text-[36px] opacity-10 text-indigo-300 font-mono">?</span>
						</div>
					{/if}
					<div class="absolute inset-0 border border-indigo-500/50 opacity-0 group-hover:opacity-100 pointer-events-none"></div>
				</button>
			{/each}
		</div>
	</div>
</div>

{#if showTooltip && selectedBall}
	<aside class="fixed bottom-12 right-12 w-[36rem] min-h-[520px] bg-[#0f0f12] border border-indigo-500 shadow-[0_0_80px_rgba(99,102,241,0.5)] z-50 text-slate-200 rounded-xl flex flex-col backdrop-blur-2xl overflow-hidden">
		<div class="relative p-10 border-b border-indigo-900/50 flex items-center justify-center h-[180px] bg-gradient-to-b from-indigo-950/50 to-transparent flex-shrink-0">
			{#if selectedBall.img}
				<div class="absolute left-10 top-1/2 -translate-y-1/2">
					<img src={selectedBall.img} alt={selectedBall.name} class="w-28 h-28 rounded-full border-2 border-indigo-400 bg-[#050507] p-2 object-contain" />
				</div>
			{/if}
			<div class="flex flex-col items-center ml-28">
				<h4 class="font-black text-3xl text-center uppercase tracking-[0.35em] text-indigo-400 leading-none">{selectedBall.name}</h4>
				<div class="h-1 w-24 bg-indigo-500/30 mt-4 rounded-full"></div>
			</div>
			<button onclick={() => showTooltip = false} class="absolute right-6 top-6 text-indigo-900 hover:text-indigo-400 text-xs font-black tracking-widest border border-indigo-900 px-2 py-1">ESC</button>
		</div>

		<div class="p-10 text-lg text-slate-300 leading-relaxed italic font-serif flex-grow min-h-[140px] cursor-pointer hover:bg-white/5" onclick={() => descExpanded = !descExpanded}>
			<div class="relative z-10 px-4">
				{#if descExpanded || selectedBall.description.length <= DESC_LIMIT}
					“{selectedBall.description}”
				{:else}
					“{selectedBall.description.slice(0, DESC_LIMIT)}...”
					<span class="text-indigo-500 font-bold block mt-4 not-italic tracking-[0.2em] uppercase text-[10px]">Expand Logs</span>
				{/if}
			</div>
		</div>

		{#if selectedBall.parents && selectedBall.parents.length > 0}
			<div class="px-10 py-6 bg-indigo-950/20 border-t border-indigo-900/30">
				<h5 class="text-[10px] font-black text-indigo-500 tracking-[0.4em] uppercase mb-4">Fusion Recipes</h5>
				<div class="flex flex-col gap-6">
					{#each selectedBall.parents as recipe, recipeIndex}
						<div class="flex flex-wrap gap-3 items-center">
							{#each recipe as parentBall, i}
								<div class="flex items-center gap-3">
									<button 
										onclick={() => selectNewBall(parentBall)}
										class="flex items-center gap-2 px-4 py-2 bg-[#1a1a1e] border border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-500/10 transition-all rounded group"
									>
										{#if parentBall.img}
											<img src={parentBall.img} alt={parentBall.name} class="w-5 h-5 object-contain" />
										{/if}
										<span class="text-indigo-200 text-xs font-bold uppercase">{parentBall.name}</span>
									</button>
									{#if i < recipe.length - 1}
										<span class="text-indigo-500 text-xl font-light">+</span>
									{/if}
								</div>
							{/each}
						</div>
						{#if recipeIndex < selectedBall.parents.length - 1}
							<div class="relative flex items-center py-2">
								<div class="flex-grow border-t border-indigo-500/10"></div>
								<span class="flex-shrink mx-4 text-[9px] font-black text-indigo-900 uppercase tracking-widest">OR</span>
								<div class="flex-grow border-t border-indigo-500/10"></div>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{/if}

		{#if childEvolutions.length > 0}
			<div class="px-10 py-6 bg-indigo-950/10 border-t border-indigo-900/30">
				<h5 class="text-[10px] font-black text-indigo-400 tracking-[0.4em] uppercase mb-4">Used In Evolutions</h5>
				<div class="flex flex-wrap gap-3 items-center">
					{#each childEvolutions as child}
						<button 
							onclick={() => selectNewBall(child)}
							class="flex items-center gap-2 px-4 py-2 bg-[#1a1a1e] border border-indigo-500/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all rounded group"
						>
							{#if child.img}
								<img src={child.img} alt={child.name} class="w-5 h-5 object-contain opacity-70 group-hover:opacity-100" />
							{/if}
							<span class="text-indigo-300/70 group-hover:text-indigo-200 text-xs font-bold uppercase">{child.name}</span>
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<div class="p-8 bg-[#050507]/80 flex flex-wrap gap-4 border-t border-indigo-900/50 flex-shrink-0">
			<div class="w-full mb-1 flex items-center gap-2">
				<span class="text-[10px] font-black text-indigo-500 tracking-[0.4em] uppercase">Element Profile</span>
				<div class="h-px flex-1 bg-indigo-900/30"></div>
			</div>
			{#each selectedBall.damageType as type}
				<span class="px-4 py-2 bg-indigo-950/40 text-indigo-300 border border-indigo-500/20 rounded text-xs font-black uppercase tracking-[0.2em]">{type}</span>
			{/each}
		</div>
	</aside>
{/if}
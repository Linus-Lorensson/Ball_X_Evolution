<script lang="ts">
	// 1. Image Loading
	const rawImages = import.meta.glob('$lib/images/baseBalls/*', { 
		eager: true, 
		import: 'default' 
	});

	const imageMap: Record<number, string> = {};
	let totalImg = 0;

	for (const [path, value] of Object.entries(rawImages)) {
		totalImg += 1;
		imageMap[totalImg] = String(value); 
	}

	// 2. State Management
	let scale = $state(1);
	let pos = $state({ x: 0, y: 0 });
	let isDragging = $state(false);
	let dragStart = { x: 0, y: 0 };
	
	let showTooltip = $state(false); 
	let selectedId = $state<string | null>(null); 

	const gridSize = $derived(totalImg + 1); 
	const totalCells = $derived(gridSize * gridSize);

	// 3. Zoom at Cursor Logic
	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		const zoomSpeed = 0.001;
		const delta = -e.deltaY * zoomSpeed;
		const newScale = Math.min(Math.max(0.2, scale + delta), 4);

		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		const gridX = (mouseX - pos.x) / scale;
		const gridY = (mouseY - pos.y) / scale;

		scale = newScale;
		pos.x = mouseX - gridX * scale;
		pos.y = mouseY - gridY * scale;
	}

	// 4. Drag Handlers
	function onMouseDown(e: MouseEvent) {
		isDragging = true;
		dragStart = { x: e.clientX - pos.x, y: e.clientY - pos.y };
	}

	function onMouseMove(e: MouseEvent) {
		if (!isDragging) return;
		pos.x = e.clientX - dragStart.x;
		pos.y = e.clientY - dragStart.y;
	}

	function onMouseUp() {
		isDragging = false;
	}

	// Updated: Allow clicking row/col 0 for image details
	function handleCellClick(row: number, col: number) {
		if (row === 0 && col === 0) return;

		if (row === 0 || col === 0) {
			// Header Click
			selectedId = `Image ${row || col}`;
		} else {
			// Data Cell Click
			const min = Math.min(row, col);
			const max = Math.max(row, col);
			selectedId = `${min}-${max}`;
		}
		showTooltip = true;
	}
</script>

<div 
	class="w-full h-full cursor-grab active:cursor-grabbing touch-none select-none overflow-hidden"
	onwheel={handleWheel}
	onmousedown={onMouseDown}
	onmousemove={onMouseMove}
	onmouseup={onMouseUp}
	onmouseleave={onMouseUp}
>
	<div 
		class="inline-block origin-top-left transition-transform duration-75 ease-out"
		style="transform: translate({pos.x}px, {pos.y}px) scale({scale});"
	>
		<div 
			class="grid bg-slate-800" 
			style="grid-template-columns: repeat({gridSize}, minmax(100px, 1fr)); gap: 1px;"
		>
			{#each Array(totalCells) as _, i}
				{@const row = Math.floor(i / gridSize)}
				{@const col = i % gridSize}
				
				<button 
					type="button"
					onclick={(e) => {
						e.stopPropagation();
						handleCellClick(row, col);
					}}
					class="aspect-square bg-white hover:bg-indigo-50 flex items-center justify-center border-none p-0 overflow-hidden"
				>
					{#if row === 0 && col === 0}
						<span class="opacity-20 text-[8px]">INDEX</span>
					{:else if row === 0}
						<img src={imageMap[col]} alt="" draggable="false" class="w-full h-full object-cover" />
					{:else if col === 0}
						<img src={imageMap[row]} alt="" draggable="false" class="w-full h-full object-cover" />
					{:else}
						<span class="text-[10px] text-slate-400">{Math.min(row, col)}:{Math.max(row, col)}</span>
					{/if}
				</button>
			{/each}
		</div>
	</div>
</div>

{#if showTooltip}
	<aside class="fixed bottom-8 right-8 w-64 p-4 bg-white border-2 border-slate-900 shadow-xl z-50">
		<div class="flex justify-between items-start mb-2">
			<h4 class="font-bold text-slate-900">Cell Details</h4>
			<button onclick={() => showTooltip = false} class="text-slate-400 hover:text-slate-600">✕</button>
		</div>
		<p class="text-sm text-slate-600">ID: {selectedId}</p>
	</aside>
{/if}
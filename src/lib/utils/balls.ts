// setup

export interface Ball {
	name: string;
	description: string;
	img: string;
	parents?: Array<Array<Ball>>; // Now points to Ball objects instead of strings
	unlockRequirement?: string;
	damageType: Array<string>;
	statusEffect?: Array<string>;
}

export function createBall(data: any): Ball {
	return {
		name: String(data.name),
		description: String(data.description),
		img: data.img ? String(data.img) : "",
		// Note: data.parents from raw JSON is likely still strings.
		// These will need to be resolved to Ball objects to satisfy the interface.
		parents: data.parents ? data.parents : undefined,
		unlockRequirement: data.unlockRequirement ? String(data.unlockRequirement) : undefined,
		damageType: data.damageType,
		statusEffect: data.statusEffect ? data.statusEffect : undefined
	};
}

export function createAllBalls(dataArray: Array<any>): Array<Ball> {
	// 1. Create a Map for quick lookup by name
	const ballMap = new Map<string, Ball>();

	// 2. Initialize all balls (first pass)
	const allBalls = dataArray.map((data) => {
		const ball = createBall(data);
		ballMap.set(ball.name, ball);
		return ball;
	});

	// 3. Link the parents (second pass)
	allBalls.forEach((ball, index) => {
		const rawParents = dataArray[index].parents; // Get the raw string arrays from JSON
		if (rawParents) {
			// Transform Array<Array<string>> into Array<Array<Ball>>
			ball.parents = rawParents.map((group: string[]) =>
				group.map((parentName: string) => {
					const parentObj = ballMap.get(parentName);
					if (!parentObj) {
						throw new Error(`Parent ball "${parentName}" not found for ${ball.name}`);
					}
					return parentObj;
				})
			);
		}
	});

	return allBalls;
}

// utility functions

export function getBaseBalls(ballArray: Array<Ball>): Array<Ball> {
	return ballArray.filter((ball) => ball.parents == undefined || ball.parents.length == 0);
}

export function getEvolutionBalls(ballArray: Array<Ball>): Array<Ball> {
	return ballArray.filter((ball) => ball.parents != undefined && ball.parents.length > 0);
}

export function getAxisBalls(ballArray: Array<Ball>): Array<Ball> {
	const ballsToShow: Array<string> = [];
	const response: Array<Ball> = [];

	ballArray.forEach((ball) => {
		if (ball.parents) {
			ball.parents.forEach((eachParentBall) => {
				eachParentBall.forEach((parentBall) => {
					// Since parentBall is now a Ball object, we access .name
					if (!ballsToShow.includes(parentBall.name)) {
						ballsToShow.push(parentBall.name);
					}
				});
			});
		}
	});

	ballArray.forEach((ball) => {
		if (ballsToShow.includes(ball.name)) {
			response.push(ball);
		}
	});

	return response;
}

export function getEvolutionBallFromParents(
	parents: Array<string>,
	evolutionBallArray: Array<Ball>
) {
	const parentCompare = JSON.stringify(parents.sort());
	return evolutionBallArray.find((evolutionBall) => {
		let doesMatch = false;
		if (evolutionBall.parents && evolutionBall.parents.length) {
			const length = evolutionBall.parents.length;
			for (let i = 0; i < length; i++) {
				// Map the Ball objects back to their names for comparison with the input strings
				const parentNames = evolutionBall.parents[i].map((p) => p.name).sort();
				const parentSet = JSON.stringify(parentNames);
				if (parentSet == parentCompare) {
					doesMatch = true;
					break;
				}
			}
		}
		return doesMatch;
	});
}

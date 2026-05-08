// setup

export interface Ball {
	name: string;
	description: string;
	img: string;
	parents?: Array<Array<string>>; // Array<Array<string>> is just be name of ball,
	unlockRequirement?: string;
	damageType: Array<string>;
	statusEffect?: Array<string>;
}

export function createBall(data: any): Ball {
	return {
		name: String(data.name),
		description: String(data.description),
		img: String(data.img),
		parents: data.parents ? data.parents : undefined,
		unlockRequirement: data.unlockRequirement ? String(data.unlockRequirement) : undefined,
		damageType: data.damageType,
		statusEffect: data.statusEffect ? data.statusEffect : undefined
	};
}

export function createAllBalls(dataArray: Array<any>): Array<Ball> {
	return dataArray.map(createBall);
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
					if (!ballsToShow.includes(parentBall)) {
						ballsToShow.push(parentBall);
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
				const parentSet = JSON.stringify(evolutionBall.parents[i].sort());
				if (parentSet == parentCompare) {
					doesMatch = true;
					break;
				}
			}
		}
		return doesMatch;
	});
}

export interface Ball {
    name: string;
    description: string;
    img: string;
    parents?: Array<Array<string>> | Array<Array<Ball>>; // choose one of these throughout app, Array<Array<string>> can just be name of ball,
    unlockRequirement?: string;
}

export function createBall(data: any): Ball {
    return {
        name: String(data.name),
        description: String(data.description),
        img: String(data.img),
        parents: data.parents ? data.parents.map((parent: any) => {
            // If parent is array of strings, keep as is; if array of objects, recursively convert
            if (Array.isArray(parent) && parent.length > 0 && typeof parent[0] === "object") {
                return parent.map((p: any) => createBall(p));
            }
            return parent;
        }) : undefined,
        unlockRequirement: data.unlockRequirement ? String(data.unlockRequirement) : undefined
    };
}

export function createAllBalls(dataArray: Array<any>): Array<Ball> {
    return dataArray.map(createBall);
}



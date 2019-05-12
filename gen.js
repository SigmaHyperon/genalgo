String.prototype.hashCode = function() {
    var hash = 0;
    if (this.length == 0) {
        return hash;
    }
    for (var i = 0; i < this.length; i++) {
        var char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}
class position {
	constructor(x = 0, y = 0){
		this.x = x;
		this.y = y;
	}
	add(pos2){
		return new position(this.x + pos2.x, this.y + pos2.y);
	}
	distance(pos2){
		return Math.sqrt(Math.pow(this.x - pos2.x, 2) + Math.pow(this.y - pos2.y, 2));
	}
	equals(pos2){
		return this.x === pos2.x && this.y === pos2.y;
	}
}
/**
 * 0: up
 * 1: down
 * 2: left
 * 3: right
 * 4: up-left
 * 5: up-right
 * 6: down-left
 * 7: down-right
 */
const instructions = {
	0: new position(0, 1),
	1: new position(0, -1),
	2: new position(-1, 0),
	3: new position(1, 0),
	4: new position(-1, 1),
	5: new position(1, 1),
	6: new position(-1, -1),
	7: new position(1, -1)
};
const arrayRandom = array => array[Math.floor(Math.random() * array.length)]
const randIntruction = () => arrayRandom(Object.keys(instructions));

const dna = {
	merge:  fn(mergeFactor => (dna1, dna2) => dna1.map((v,i) => Math.random() > mergeFactor ? v : dna2[i])),
	mutate: fn(mutationRate => (dna1) => dna1.map((v, i) => Math.random() > mutationRate ? v : randIntruction())),
	random: fn((dnaLength) => () => Array.from({length: dnaLength}, (value, key) => randIntruction()))
};

const collision = (pos, obstacle) => {
	return pos.x > obstacle.ll.x && pos.x < obstacle.ur.x && pos.y > obstacle.ll.y && pos.y < obstacle.ur.y;
}

const evaluateGen = fn(world => gen => {
	const dist = world.spawn.distance(world.target);
	let steps = 0;
	let pos = world.spawn;
	gen.some(element => {
		const nPos = pos.add(instructions[element]);
		if((Array.isArray(world.obstacles) && !world.obstacles.some(v => collision(nPos, v))) || !Array.isArray(world.obstacles))
			pos = pos.add(instructions[element]);
		steps++;
		return pos.equals(world.target);
	});
	return dist - pos.distance(world.target)/*  * (1 / steps) * 1000 */;
});
const finalPos = fn(world => gen => {
	let pos = world.spawn;
	gen.some(element => {
		const nPos = pos.add(instructions[element]);
		if((Array.isArray(world.obstacles) && !world.obstacles.some(v => collision(nPos, v))) || !Array.isArray(world.obstacles))
			pos = pos.add(instructions[element]);
		return pos.equals(world.target);
	});
	return pos;
});

const initPop = fn(dnaRandom => popSize => () => Array.from({length: popSize}, () => dnaRandom()));

const runPop = fn(evaluate => pop => pop.map(element => ({dna: element, fitness: evaluate(element)})));

const sortPop = pop => pop.sort((a,b) => a.fitness - b.fitness).reverse().map(v => v.dna);

const selectNextGeneration = fn(popSize => pop => pop.slice(0, popSize / 2));

const generateOffsprings = fn(dnaMerge => popSize => pop => {
	const newPop = [...pop];
	while(newPop.length < popSize){
		newPop.push(dnaMerge(arrayRandom(pop), arrayRandom(pop)));
	}
	return newPop;
});

const mutatePop = dnaMutate => pop => {
	const best = pop[0].slice();
	pop = pop.map(v => dnaMutate(v));
	pop.push(best);
	//console.log(pop[0].join('').hashCode() == pop[pop.length - 1].join('').hashCode());
	return pop;
};

const preSet = options => {
	const _dnaRandom = dna.random(options.dnaLength);
	const _dnaMerge = dna.merge(options.mergeFactor);
	const _dnaMutate = dna.mutate(options.mutationRate);

	const _initPop = initPop(_dnaRandom, options.popSize);
	const _runPop = runPop(evaluateGen(options.world));
	const _selectNextGeneration = selectNextGeneration(options.popSize);
	const _generateOffsprings = generateOffsprings(_dnaMerge, options.popSize);
	const _mutatePop = mutatePop(_dnaMutate);

	return {init: _initPop, generation: compose(_runPop, sortPop, _selectNextGeneration, _generateOffsprings, _mutatePop)};
}
const run = options => {
	const {init, generation} = preSet(options);
	let pop = init();
	const stats = [];
	for(var i = 1; i < options.generations; i++){
		pop = generation(pop);
		stats.push(evaluateGen(options.world, pop[0]));
	}
	return {stats, best: pop[0]};
}
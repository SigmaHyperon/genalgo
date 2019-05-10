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
const spawn = new position();
const target = new position(75,25);
const dist = target.distance(spawn);
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

const evaluateGen = gen => {
	let steps = 0;
	let pos = spawn;
	gen.some(element => {
		pos = pos.add(instructions[element]);
		steps++;
		return pos.equals(target);
	});
	return (dist - pos.distance(target)) / (dist - steps);
};

const initPop = fn(dnaRandom => popSize => () => Array.from({length: popSize}, () => dnaRandom()));

const runPop = pop => pop.map(element => { return {dna: element, fitness: evaluateGen(element)}; });

const sortPop = pop => pop.sort((a,b) => a.fitness - b.fitness).reverse().map(v => v.dna);

const selectNextGeneration = fn(popSize => pop => pop.slice(0, popSize / 2));

const generateOffsprings = fn(dnaMerge => popSize => pop => {
	const newPop = [...pop];
	while(newPop.length < popSize){
		newPop.push(dnaMerge(arrayRandom(pop), arrayRandom(pop)));
	}
	return newPop;
});

const mutatePop = dnaMutate => pop => pop.map(v => dnaMutate(v));

const preSet = options => {
	const _dnaRandom = dna.random(options.dnaLength);
	const _dnaMerge = dna.merge(options.mergeFactor);
	const _dnaMutate = dna.mutate(options.mutationRate);

	const _initPop = initPop(_dnaRandom, options.popSize);
	const _selectNextGeneration = selectNextGeneration(options.popSize);
	const _generateOffsprings = generateOffsprings(_dnaMerge, options.popSize);
	const _mutatePop = mutatePop(_dnaMutate);

	return {init: _initPop, generation: compose(runPop, sortPop, _selectNextGeneration, _generateOffsprings, _mutatePop)};
}
const run = options => {
	const {init, generation} = preSet(options);
	let pop = init();
	const stats = [];
	for(var i = 1; i < options.generations; i++){
		pop = generation(pop);
		stats.push(evaluateGen(pop[0]));
	}
	return {stats, best: pop[0]};
}
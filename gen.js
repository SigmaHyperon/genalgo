if(module){
	var {fn, compose} = require('./pure');
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
const mergeFactor = 0.5;
const mutationRate = 0.01;
const dnaLength = 100;
const popSize = 100;
const generations = 100;
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
//const instructions = [0,1,2,3];
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
const arrayRandom = (array) => array[Math.floor(Math.random() * array.length)]
const randIntruction = () => {
	const keys = Object.keys(instructions);
	return arrayRandom(keys);
}

class dna {
	constructor(code = []){
		this.setCode(code);
		this.fitness = 0;
	}
	merge(dna2){
		let newCode = this.code.map((v,i) => Math.random() > mergeFactor ? v : dna2.code[i]);
		return new dna(newCode);
	}
	mutate(){
		let newCode = this.code.map((v, i) => Math.random() > mutationRate ? v : randIntruction());
		return new dna(newCode);
	}
	setCode(code){
		this.code = code.slice(0,dnaLength);
	}
}
dna.random = () => new dna(Array.from({length: dnaLength}, (value, key) => randIntruction()));

function evaluateGen(gen){
	let steps = 0;
	let pos = spawn;
	gen.code.some(element => {
		pos = pos.add(instructions[element]);
		steps++;
		return pos.equals(target);
	});
	return (dist - pos.distance(target)) / (dist - steps);
}

function initPop(){
	return Array.from({length: popSize}, () => dna.random());
}
function runPop(pop){
	return pop.map(element => {
		return {dna: element, fitness: evaluateGen(element)};
	});
}
function sortPop(pop){
	return pop.sort((a,b) => a.fitness - b.fitness).reverse().map(v => v.dna);
}
function selectNextGeneration(pop){
	return pop.slice(0, popSize / 2);
}
function generateOffsprings(pop){
	const newPop = [...pop];
	while(newPop.length < popSize){
		newPop.push(arrayRandom(pop).merge(arrayRandom(pop)));
	}
	return newPop;
}
function mutatePop(pop){
	return pop.map(v => v.mutate());
}

let population = [];
const generation = compose(runPop, sortPop, selectNextGeneration, generateOffsprings, mutatePop);

function run(pop){
	pop = initPop()
	const stats = [];
	for(var i = 1; i < generations; i++){
		pop = generation(pop);
		stats.push(evaluateGen(pop[0]));
	}
	console.log(stats);
}
run(population);
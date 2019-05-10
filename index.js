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
class population{
	constructor(){
		this.population = [];
		this.mergeFactor = 0.5;
		this.mutationRate = 0.01;
		this.dnaLength = 100;
		this.popSize = 100;
		this.generations = 100;
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
const compose = (...fns) => x => fns.reduce((v, f) => f(v), x);

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

class rocket{
	constructor(){
		this.dna = dna.random();
		this.position = new position();
	}
	applyCode(){
		const _self = this;
		let steps = 0;
		this.dna.code.some(element => {
			_self.position = _self.position.add(instructions[element]);
			steps++;
			return _self.position.equals(target);
		});
		this.fitness = (dist - this.position.distance(target)) / (dist - steps);
		return this;
	}
}

function initPop(){
	return Array.from({length: popSize}, value => new rocket());
}
function resetPop(pop){
	pop.forEach(element => element.position = new position());
	return pop;
}
function runPop(pop){
	return pop.map(v => v.applyCode());
}
function sortPop(pop){
	return pop.sort((a,b) => a.fitness - b.fitness).reverse();
}
function selectNextGeneration(pop){
	return pop.slice(0, popSize / 2);
}
function generateOffsprings(pop){
	const newPop = [...pop];
	while(newPop.length < popSize){
		const offspring = new rocket();
		offspring.dna = arrayRandom(pop).dna.merge(arrayRandom(pop).dna);
		newPop.push(offspring);
	}
	return newPop;
}
function mutatePop(pop){
	pop.forEach(element => {
		element.dna = element.dna.mutate();
	});
	return pop;
}

let population = [];
const generation = compose(resetPop, runPop, sortPop, selectNextGeneration, generateOffsprings, mutatePop);

function run(pop){
	pop = initPop()
	const stats = [];
	for(var i = 1; i < generations; i++){
		pop = generation(pop);
		stats.push(pop[0].fitness);
	}
}
run(population);
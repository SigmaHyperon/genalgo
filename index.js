let data = {
    labels: [],
    datasets: []
};
function _addDataset(chart, d){
    data.datasets.push({
        label: `data #${data.datasets.length}`,
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        fill: false,
        data: d
    });
    if(data.labels.length < d.length) data.labels = Array.from({length: d.length}, (v, k) => k);
    chart.update();
}
const addDataset = fn(chart => data => {return _addDataset(chart, data)});



function init(){
    var ctx = document.getElementById('chart').getContext('2d');
    var chart = new Chart(ctx, {
        type: 'line',
    
        data,
    
        options: {}
    });
    const addDatasetSeeded = addDataset(chart);
    $('button#add').on('click', () => {
        const opt = {
            mergeFactor: 0.5,
            mutationRate: 0.01,
            dnaLength: 90,
            popSize: 100,
            generations: 40,
            world: {
                spawn: new position(),
                target: new position(75, 25)
            }
        }
        const result = run(opt)
        addDatasetSeeded(result.stats);
        console.log(result);
        console.log(finalPos({spawn: new position(),target: new position(75, 25)}, result.best));
    });
}
$(init);


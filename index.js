let data = {
    labels: Array.from({length: generations}, (v, k) => k),
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
            dnaLength: 100,
            popSize: 100,
            generations: 100
        }
        const temp = new scenario(opt);
        addDatasetSeeded(temp.run().stats);
    });
}
$(init);


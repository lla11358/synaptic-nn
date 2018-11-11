/**
* 7 neurons for the input layer. They would represent the last 7 characters of the first name or last name.
* 6 neurons for the hidden layer
* 2 neurons for the output layer (one for first name, one for last name)
*/
var INPUT_LENGTH = 7;
var myNetwork = new synaptic.Architect.Perceptron(INPUT_LENGTH, 6, 2);
var trainingData = [];
var trainer = new synaptic.Trainer(myNetwork);

/**
 * A function that can convert a name to a format that the neural network understands:
* it can only take floating point numbers between 0 and 1. So, I decided to convert each 
* of the last INPUT_LENGTH characters in the name to their character codes, and divide them by 1000.
* If a name was too short, it is padded with spaces.
*/
function convertNameToInput(name) {
    name = name.toLowerCase();
    if(name.length > INPUT_LENGTH)
        name = name.substring(INPUT_LENGTH);
 
    while(name.length < INPUT_LENGTH)
        name = " " + name;
 
    var characters = name.split("");
    return characters.map(
       (c) => c == " " ? 0 : c.charCodeAt(0)/1000
    );
 }

 /**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

 /**
  * Accept a name as input and tell if it is a first name or a last name
  */
 function getOrder(name) {
    var result = myNetwork.activate(convertNameToInput(name));
    if(result[0] > result[1])
       return "First name (" + (result[0]*100).toFixed() + "% sure)";
    return "Last name (" + (result[1]*100).toFixed() + "% sure)";
}

/**
 * Once I had the names in two JavaScript arrays, I had to convert them to a format that Synaptic’s Trainer understands.
* It’s a simple format. You simply specify the values of the input neurons, and the values of the output neurons.
* Two for loops did the job.
*/
for(var i = 0; i < last_names.length; i++) {
    trainingData.push({
        input: convertNameToInput(last_names[i]),
        output: [0, 1] // first name = false, last name = true
    });
}

for(var i = 0; i < first_names.length; i++) {
    for(var j = 0; j < 2; j++) {
        trainingData.push({
            input: convertNameToInput(first_names[i]),
            output: [1, 0] // first name = true, last name = false
        });
    }
}

// Training data is said to be good only if it has been shuffled well
for(var i=0;i<10;i++)
    trainingData = shuffle(trainingData);

/**
 * All that was left to do was run the actual training.
* I ran a total of 5000 iterations: 25 batches of 200 iterations each. 
* For the learning rate I experimented with various values, and found that 0.01 was optimal. 
* As for the cost function, I tried both CROSS_ENTROPY and MSE, and found that MSE was better.
*/
for(var i = 0 ; i < 25 ; i++) {           
    trainer.train(trainingData, {
        rate: 0.01,
        iterations: 200,
        shuffle: true,
        cost: synaptic.Trainer.cost.MSE
    });
    var error = trainer.test(trainingData)["error"];
    console.log(
       "Iteration " + ((i+1) * 200) + " --> Error: " + error
    );
}

/**
 * Finally, test it with a few random names.
 */
for(var i = 0; i < test_parse_names.length; i++) {
    names = test_parse_names[i].split(" ");
    parsed_names = "";
    for(var j = 0; j < names.length; j++) {
        parsed_names += names[j] + ": " + getOrder(names[j]) + ";";
    }
    console.log(test_parse_names[i] + " -> " + parsed_names);
}